import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { nftApi } from '../services/api';
import NFTGrid from '../components/nft/NFTGrid';
import Loading from '../components/ui/Loading';
import ExplorerLink from '../components/ui/ExplorerLink';
import { User, Palette, ShoppingBag } from 'lucide-react';
import type { NFT } from '../types/index';

const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const { address, isConnected } = useUserStore();
  const [searchParams] = useSearchParams();
  
  // 从 URL 参数读取初始标签，默认为 'created'
  const initialTab = (searchParams.get('tab') as 'created' | 'collected' | 'listed') || 'created';
  const [activeTab, setActiveTab] = useState<'created' | 'collected' | 'listed'>(initialTab);
  
  const [createdNFTs, setCreatedNFTs] = useState<NFT[]>([]);
  const [collectedNFTs, setCollectedNFTs] = useState<NFT[]>([]);
  const [listedNFTs, setListedNFTs] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address) return;

    const fetchNFTs = async () => {
      setLoading(true);
      try {
        console.log('🔍 Fetching NFTs for address:', address);
        
        // Fetch created NFTs
        const createdResponse = await nftApi.list({
          creator: address.toLowerCase(),
          limit: 100,
        });
        console.log('✅ Created NFTs:', createdResponse);
        setCreatedNFTs(createdResponse.items);

        // Fetch collected NFTs (owned but not created)
        const ownedResponse = await nftApi.list({
          owner: address.toLowerCase(),
          limit: 100,
        });
        console.log('✅ Owned NFTs:', ownedResponse);
        const collected = ownedResponse.items.filter(
          nft => nft.creator.toLowerCase() !== address.toLowerCase()
        );
        console.log('✅ Collected NFTs (filtered):', collected);
        setCollectedNFTs(collected);

        // Fetch listed NFTs
        const listedResponse = await nftApi.list({
          owner: address.toLowerCase(),
          is_listed: true,
          limit: 100,
        });
        console.log('✅ Listed NFTs:', listedResponse);
        setListedNFTs(listedResponse.items);
      } catch (error) {
        console.error('❌ Error fetching NFTs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, [address]);

  if (!isConnected || !address) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center py-20">
          <User className="w-20 h-20 mx-auto mb-6 text-white/30" />
          <h2 className="text-3xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-white/70 mb-8">Please connect your wallet to view your profile</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Loading />
      </div>
    );
  }

  const tabs = [
    { id: 'created' as const, label: t('profile.created'), count: createdNFTs.length, icon: Palette },
    { id: 'collected' as const, label: t('profile.collected'), count: collectedNFTs.length, icon: ShoppingBag },
    { id: 'listed' as const, label: t('profile.listed'), count: listedNFTs.length, icon: ShoppingBag },
  ];

  const getCurrentNFTs = () => {
    switch (activeTab) {
      case 'created':
        return createdNFTs;
      case 'collected':
        return collectedNFTs;
      case 'listed':
        return listedNFTs;
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Profile Header */}
      <div className="card mb-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center text-4xl">
            👤
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold mb-2">{t('profile.title')}</h1>
            <div className="mb-4">
              <ExplorerLink address={address} />
            </div>
            
            {/* Stats */}
            <div className="flex flex-wrap gap-6 justify-center md:justify-start">
              <div>
                <p className="text-2xl font-bold text-cyber-cyan">{createdNFTs.length}</p>
                <p className="text-sm text-white/50">{t('profile.stats.created')}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-cyber-cyan">{collectedNFTs.length}</p>
                <p className="text-sm text-white/50">{t('profile.stats.collected')}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-cyber-cyan">
                  {createdNFTs.filter(nft => !nft.isListed && nft.owner !== nft.creator).length}
                </p>
                <p className="text-sm text-white/50">{t('profile.stats.sold')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-gradient-primary text-white'
                : 'glass-hover text-white/70'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
            <span className={`px-2 py-0.5 rounded-full text-sm ${
              activeTab === tab.id ? 'bg-white/20' : 'bg-white/10'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* NFT Grid */}
      <NFTGrid nfts={getCurrentNFTs()} />
    </div>
  );
};

export default ProfilePage;
