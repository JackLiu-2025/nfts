import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import { validateFileType, validateFileSize, validateNFTName, validateNFTDescription, validateRoyalty } from '../utils/format';
import { uploadNFT } from '../services/ipfs';
import { mintNFT } from '../services/nft';
import { useUserStore } from '../store/userStore';

const MintPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isConnected, updateBalance } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [royalty, setRoyalty] = useState('5');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const categoryOptions = [
    { value: '', label: t('mint.selectCategory') },
    { value: 'art', label: t('marketplace.art') },
    { value: 'collectible', label: t('marketplace.collectible') },
    { value: 'gaming', label: t('marketplace.gaming') },
    { value: 'music', label: t('marketplace.music') },
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateFileType(file)) {
      setErrors({ ...errors, image: t('toast.invalidFile') });
      return;
    }

    if (!validateFileSize(file)) {
      setErrors({ ...errors, image: t('toast.invalidFile') });
      return;
    }

    setImage(file);
    setImagePreview(URL.createObjectURL(file));
    setErrors({ ...errors, image: '' });
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!image) newErrors.image = 'Image is required';
    if (!validateNFTName(name)) newErrors.name = 'Name must be 1-100 characters';
    if (!validateNFTDescription(description)) newErrors.description = 'Description must be max 1000 characters';
    if (!category) newErrors.category = 'Category is required';
    if (!validateRoyalty(parseFloat(royalty))) newErrors.royalty = 'Royalty must be 0-10%';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleMint = async () => {
    if (!isConnected) {
      toast.error(t('toast.connectWallet'));
      return;
    }

    if (!validate()) {
      toast.error('Please fix the errors');
      return;
    }

    if (!image) {
      toast.error('Please upload an image');
      return;
    }

    setLoading(true);
    
    try {
      // 1. 上传图片和元数据到IPFS
      setUploadProgress(t('mint.uploadingToIPFS'));
      const tokenURI = await uploadNFT(
        image,
        name,
        description,
        [
          { trait_type: 'Category', value: category },
          { trait_type: 'Royalty', value: parseFloat(royalty) },
        ]
      );
      
      // 2. 铸造NFT
      setUploadProgress(t('mint.minting'));
      const { tokenId, transactionHash } = await mintNFT(
        tokenURI,
        Math.floor(parseFloat(royalty) * 100), // 转换为基点 (5% = 500)
        category
      );
      
      // 3. 更新余额
      await updateBalance();
      
      toast.success(
        <div>
          <p>{t('mint.success')}</p>
          <p className="text-sm text-white/70 mt-1">Token ID: {tokenId}</p>
        </div>
      );
      
      setLoading(false);
      setUploadProgress('');
      
      // 跳转到个人中心
      navigate('/profile');
    } catch (error: any) {
      console.error('Mint error:', error);
      toast.error(error.message || t('mint.failed'));
      setLoading(false);
      setUploadProgress('');
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-8">
          {t('mint.title')}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="space-y-6">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                {t('mint.uploadImage')} *
              </label>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  errors.image ? 'border-cyber-error' : 'border-white/20 hover:border-cyber-cyan'
                }`}
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-white/50" />
                <p className="text-white/70 mb-2">{t('mint.dragDrop')}</p>
                <p className="text-sm text-white/50">{t('mint.supportedFormats')}</p>
                <input
                  id="file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
              {errors.image && <p className="mt-2 text-sm text-cyber-error">{errors.image}</p>}
            </div>

            <Input
              label={`${t('mint.name')} *`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('mint.namePlaceholder')}
              error={errors.name}
            />

            <Textarea
              label={t('mint.description')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('mint.descriptionPlaceholder')}
              rows={4}
              error={errors.description}
            />

            <Select
              label={`${t('mint.category')} *`}
              value={category}
              onChange={setCategory}
              options={categoryOptions}
              error={errors.category}
            />

            <Input
              type="number"
              label={`${t('mint.royalty')} *`}
              value={royalty}
              onChange={(e) => setRoyalty(e.target.value)}
              placeholder={t('mint.royaltyHint')}
              min={0}
              max={10}
              step={0.1}
              error={errors.royalty}
            />

            <Button
              onClick={handleMint}
              loading={loading}
              className="w-full"
              size="lg"
              disabled={!isConnected}
            >
              {loading ? uploadProgress || t('mint.minting') : t('mint.mint')}
            </Button>

            {!isConnected && (
              <p className="text-center text-sm text-cyber-error">
                {t('toast.connectWallet')}
              </p>
            )}
          </div>

          {/* Preview */}
          <div className="card">
            <h3 className="text-xl font-bold mb-4">{t('mint.preview')}</h3>
            {imagePreview ? (
              <div className="space-y-4">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full aspect-square object-cover rounded-lg"
                />
                <div>
                  <h4 className="text-2xl font-bold mb-2">{name || 'NFT Name'}</h4>
                  <p className="text-white/70 mb-4">{description || 'NFT Description'}</p>
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <p className="text-white/50 mb-1">{t('nft.category')}</p>
                      <p className="capitalize">{category || '-'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/50 mb-1">{t('nft.royalty')}</p>
                      <p>{royalty}%</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="aspect-square rounded-lg glass flex items-center justify-center">
                <p className="text-white/50">Upload an image to preview</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MintPage;
