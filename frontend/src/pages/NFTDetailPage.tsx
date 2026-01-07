import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ShoppingCart, Tag, Flame } from 'lucide-react';
import toast from 'react-hot-toast';
import { nftApi, transactionApi } from '../services/api';
import { useUserStore } from '../store/userStore';
import { formatPrice, formatDate } from '../utils/format';
import { listNFT, buyNFT, cancelListing, burnNFT } from '../services/nft';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Loading from '../components/ui/Loading';
import ExplorerLink from '../components/ui/ExplorerLink';
import type { NFT, Transaction } from '../types/index';

const NFTDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { address, isConnected, updateBalance } = useUserStore();
  
  const [nft, setNft] = useState<NFT | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [showBurnModal, setShowBurnModal] = useState(false);
  const [listPrice, setListPrice] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchNFT = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const tokenId = parseInt(id.replace('nft-', ''));
        const nftData = await nftApi.get(tokenId);
        setNft(nftData);

        // Fetch transactions
        const txResponse = await transactionApi.list({
          token_id: tokenId,
          limit: 50,
        });
        setTransactions(txResponse.items);
      } catch (error) {
        console.error('Error fetching NFT:', error);
        setNft(null);
      } finally {
        setLoading(false);
      }
    };

    fetchNFT();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Loading />
      </div>
    );
  }

  if (!nft) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center py-20">
          <h2 className="text-3xl font-bold mb-4">NFT Not Found</h2>
          <Button onClick={() => navigate('/marketplace')}>
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  const isOwner = address?.toLowerCase() === nft.owner.toLowerCase();
  const isCreator = address?.toLowerCase() === nft.creator.toLowerCase();

  const handleBuy = async () => {
    if (!nft.price) {
      toast.error('Price not set');
      return;
    }

    setActionLoading(true);
    try {
      const { transactionHash } = await buyNFT(nft.tokenId, nft.price);
      
      // 更新余额
      await updateBalance();
      
      toast.success(
        <div>
          <p>{t('toast.transactionSuccess')}</p>
          <p className="text-sm text-white/70 mt-1">TX: {transactionHash.slice(0, 10)}...</p>
          <p className="text-sm text-cyber-cyan mt-2">Redirecting to your collection in 2s...</p>
        </div>,
        { duration: 2000 }
      );
      
      // 2秒后跳转到个人中心的"收藏"标签
      setTimeout(() => {
        navigate('/profile?tab=collected');
      }, 2000);
      
      // 重新加载NFT数据
      const updatedNFT = await nftApi.get(nft.tokenId);
      setNft(updatedNFT);
      
      setShowBuyModal(false);
    } catch (error: any) {
      console.error('Buy error:', error);
      toast.error(error.message || 'Failed to buy NFT');
    } finally {
      setActionLoading(false);
    }
  };

  const handleList = async () => {
    const price = parseFloat(listPrice);
    if (!price || price < 0.1 || price > 1000000) {
      toast.error('Price must be between 0.1 and 1,000,000 MATIC');
      return;
    }

    setActionLoading(true);
    try {
      const { transactionHash } = await listNFT(nft.tokenId, listPrice);
      
      toast.success(
        <div>
          <p>NFT listed successfully!</p>
          <p className="text-sm text-white/70 mt-1">TX: {transactionHash.slice(0, 10)}...</p>
          <p className="text-sm text-cyber-cyan mt-2">Redirecting to your listings in 3s...</p>
        </div>,
        { duration: 3000 }
      );
      
      // 3秒后跳转到个人中心的"出售中"标签
      setTimeout(() => {
        navigate('/profile?tab=listed');
      }, 3000);
      
      // 重新加载NFT数据
      const updatedNFT = await nftApi.get(nft.tokenId);
      setNft(updatedNFT);
      
      setShowListModal(false);
      setListPrice('');
    } catch (error: any) {
      console.error('List error:', error);
      toast.error(error.message || 'Failed to list NFT');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelListing = async () => {
    setActionLoading(true);
    try {
      const { transactionHash } = await cancelListing(nft.tokenId);
      
      toast.success(
        <div>
          <p>Listing cancelled successfully!</p>
          <p className="text-sm text-white/70 mt-1">TX: {transactionHash.slice(0, 10)}...</p>
          <p className="text-sm text-cyber-cyan mt-2">Redirecting to marketplace in 3s...</p>
        </div>,
        { duration: 3000 }
      );
      
      // 3秒后跳转到市场页面
      setTimeout(() => {
        navigate('/marketplace');
      }, 3000);
      
      // 重新加载NFT数据
      const updatedNFT = await nftApi.get(nft.tokenId);
      setNft(updatedNFT);
    } catch (error: any) {
      console.error('Cancel listing error:', error);
      toast.error(error.message || 'Failed to cancel listing');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBurn = async () => {
    setActionLoading(true);
    try {
      const { transactionHash } = await burnNFT(nft.tokenId);
      
      toast.success(
        <div>
          <p>NFT burned successfully!</p>
          <p className="text-sm text-white/70 mt-1">TX: {transactionHash.slice(0, 10)}...</p>
        </div>
      );
      
      setShowBurnModal(false);
      navigate('/profile');
    } catch (error: any) {
      console.error('Burn error:', error);
      toast.error(error.message || 'Failed to burn NFT');
      setActionLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2"
      >
        <ArrowLeft className="w-5 h-5" />
        {t('common.back')}
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image */}
        <div className="card">
          <img
            src={nft.image}
            alt={nft.name}
            className="w-full aspect-square object-cover rounded-lg"
          />
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full glass text-sm capitalize">
                {nft.category}
              </span>
              {nft.isListed && (
                <span className="px-3 py-1 rounded-full bg-gradient-primary text-sm">
                  For Sale
                </span>
              )}
            </div>
            <h1 className="text-4xl font-bold mb-4">{nft.name}</h1>
            <p className="text-white/70">{nft.description}</p>
          </div>

          {/* Price */}
          {nft.isListed && nft.price && (
            <div className="card">
              <p className="text-white/50 mb-2">{t('nft.price')}</p>
              <p className="text-3xl font-bold text-cyber-cyan">{formatPrice(nft.price)}</p>
            </div>
          )}

          {/* Info */}
          <div className="card space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-white/50">{t('nft.creator')}</span>
              <ExplorerLink address={nft.creator} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/50">{t('nft.owner')}</span>
              <ExplorerLink address={nft.owner} />
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">{t('nft.royalty')}</span>
              <span>{nft.royalty}%</span>
            </div>
          </div>

          {/* Actions */}
          {isConnected && (
            <div className="space-y-3">
              {!isOwner && nft.isListed && nft.price && (
                <Button
                  onClick={() => setShowBuyModal(true)}
                  className="w-full flex items-center justify-center gap-2"
                  size="lg"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {t('nft.buy')}
                </Button>
              )}

              {isOwner && !nft.isListed && (
                <Button
                  onClick={() => setShowListModal(true)}
                  className="w-full flex items-center justify-center gap-2"
                  size="lg"
                >
                  <Tag className="w-5 h-5" />
                  {t('nft.list')}
                </Button>
              )}

              {isOwner && nft.isListed && (
                <Button
                  variant="secondary"
                  onClick={handleCancelListing}
                  loading={actionLoading}
                  className="w-full"
                >
                  {t('nft.unlist')}
                </Button>
              )}

              {isOwner && (
                <Button
                  variant="danger"
                  onClick={() => setShowBurnModal(true)}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Flame className="w-5 h-5" />
                  {t('nft.burn')}
                </Button>
              )}
            </div>
          )}

          {/* Transaction History */}
          <div className="card">
            <h3 className="text-xl font-bold mb-4">{t('nft.history')}</h3>
            {transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg glass">
                    <div className="flex-1">
                      <div className="flex items-center gap-1 flex-wrap">
                        <ExplorerLink address={tx.to} />
                        <span className="text-white/50">bought from</span>
                        <ExplorerLink address={tx.from} />
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm text-white/50">{formatDate(new Date(tx.timestamp).toISOString())}</p>
                        <ExplorerLink txHash={tx.txHash} showCopy={false} />
                      </div>
                    </div>
                    <p className="text-cyber-cyan font-bold ml-4">{formatPrice(tx.price)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/50 text-center py-4">{t('nft.noHistory')}</p>
            )}
          </div>
        </div>
      </div>

      {/* Buy Modal */}
      <Modal isOpen={showBuyModal} onClose={() => setShowBuyModal(false)} title={t('modal.buyNFT')}>
        <div className="space-y-4">
          <p>{t('modal.buyConfirm')}</p>
          <div className="card">
            <p className="text-white/50 mb-2">{t('nft.price')}</p>
            <p className="text-2xl font-bold text-cyber-cyan">{nft.price && formatPrice(nft.price)}</p>
          </div>
          <div className="flex gap-4">
            <Button variant="secondary" onClick={() => setShowBuyModal(false)} className="flex-1">
              {t('modal.cancel')}
            </Button>
            <Button onClick={handleBuy} loading={actionLoading} className="flex-1">
              {t('modal.confirm')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* List Modal */}
      <Modal isOpen={showListModal} onClose={() => setShowListModal(false)} title={t('modal.listNFT')}>
        <div className="space-y-4">
          <Input
            type="number"
            label={t('modal.listPrice')}
            value={listPrice}
            onChange={(e) => setListPrice(e.target.value)}
            placeholder="0.1"
            min={0.1}
            step={0.01}
          />
          <p className="text-sm text-white/50">
            {t('modal.minPrice')}: 0.1 MATIC
          </p>
          <div className="flex gap-4">
            <Button variant="secondary" onClick={() => setShowListModal(false)} className="flex-1">
              {t('modal.cancel')}
            </Button>
            <Button onClick={handleList} loading={actionLoading} className="flex-1">
              {t('modal.listConfirm')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Burn Modal */}
      <Modal isOpen={showBurnModal} onClose={() => setShowBurnModal(false)} title={t('modal.burnNFT')}>
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-cyber-error/10 border border-cyber-error/30">
            <p className="text-cyber-error font-medium">
              {isCreator ? t('modal.burnWarningCreated') : t('modal.burnWarningCollected')}
            </p>
          </div>
          <div className="flex gap-4">
            <Button variant="secondary" onClick={() => setShowBurnModal(false)} className="flex-1">
              {t('modal.cancel')}
            </Button>
            <Button variant="danger" onClick={handleBurn} loading={actionLoading} className="flex-1">
              {t('modal.burnConfirm')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default NFTDetailPage;
