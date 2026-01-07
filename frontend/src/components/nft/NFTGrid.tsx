import React from 'react';
import type { NFT } from '../../types/index';
import NFTCard from './NFTCard';
import Loading from '../ui/Loading';
import { useTranslation } from 'react-i18next';

interface NFTGridProps {
  nfts: NFT[];
  loading?: boolean;
}

const NFTGrid: React.FC<NFTGridProps> = ({ nfts, loading = false }) => {
  const { t } = useTranslation();

  if (loading) {
    return <Loading />;
  }

  if (nfts.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🎨</div>
        <p className="text-xl text-white/50">{t('marketplace.noResults')}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {nfts.map((nft) => (
        <NFTCard key={nft.id} nft={nft} />
      ))}
    </div>
  );
};

export default NFTGrid;
