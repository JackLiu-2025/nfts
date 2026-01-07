import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, SlidersHorizontal } from 'lucide-react';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import NFTGrid from '../components/nft/NFTGrid';
import Loading from '../components/ui/Loading';
import { nftApi } from '../services/api';
import type { NFT } from '../types/index';

const MarketplacePage: React.FC = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Fetch NFTs from API
  useEffect(() => {
    const fetchNFTs = async () => {
      setLoading(true);
      try {
        const response = await nftApi.list({
          is_listed: true,
          category: category || undefined,
          search: search || undefined,
          limit: 100,
          sort_by: 'created_at',
          sort_order: 'desc',
        });
        
        // Apply price filters on client side
        let filtered = response.items;
        if (minPrice) {
          filtered = filtered.filter(nft => nft.price && nft.price >= parseFloat(minPrice));
        }
        if (maxPrice) {
          filtered = filtered.filter(nft => nft.price && nft.price <= parseFloat(maxPrice));
        }
        
        setNfts(filtered);
        setTotal(filtered.length);
      } catch (error) {
        console.error('Error fetching NFTs:', error);
        setNfts([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, [search, category, minPrice, maxPrice]);

  const categoryOptions = [
    { value: '', label: t('marketplace.allCategories') },
    { value: 'art', label: t('marketplace.art') },
    { value: 'collectible', label: t('marketplace.collectible') },
    { value: 'gaming', label: t('marketplace.gaming') },
    { value: 'music', label: t('marketplace.music') },
  ];

  const handleReset = () => {
    setSearch('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-8">
        {t('marketplace.title')}
      </h1>

      {/* Search and Filters */}
      <div className="card mb-8">
        {/* Search Bar */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('marketplace.search')}
              className="input pl-12"
            />
          </div>
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span className="hidden sm:inline">{t('marketplace.filters')}</span>
          </Button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/10">
            <Select
              value={category}
              onChange={setCategory}
              options={categoryOptions}
              label={t('marketplace.category')}
            />
            <Input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="0.001"
              label={t('marketplace.minPrice')}
              min={0}
              step={0.001}
            />
            <Input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="1000"
              label={t('marketplace.maxPrice')}
              min={0}
              step={0.001}
            />
            <div className="md:col-span-3 flex gap-4">
              <Button onClick={handleReset} variant="secondary" className="flex-1">
                {t('marketplace.reset')}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="mb-4 text-white/70">
            {total} {total === 1 ? 'NFT' : 'NFTs'} found
          </div>
          <NFTGrid nfts={nfts} />
        </>
      )}
    </div>
  );
};

export default MarketplacePage;
