import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { NFT } from '../../types/index';
import { formatPrice } from '../../utils/format';
import ExplorerLink from '../ui/ExplorerLink';

interface NFTCardProps {
  nft: NFT;
}

const NFTCard: React.FC<NFTCardProps> = ({ nft }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      className="card-hover cursor-pointer group"
      onClick={() => navigate(`/nft/${nft.id}`)}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden rounded-lg mb-4">
        <img
          src={nft.image}
          alt={nft.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 rounded-full glass text-xs font-medium capitalize">
            {nft.category}
          </span>
        </div>

        {/* Listed badge */}
        {nft.isListed && nft.price && (
          <div className="absolute top-3 right-3">
            <span className="px-3 py-1 rounded-full bg-gradient-primary text-xs font-medium">
              For Sale
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="space-y-3">
        <h3 className="text-xl font-bold text-white group-hover:text-gradient transition-all">
          {nft.name}
        </h3>

        <div className="flex items-center justify-between text-sm">
          <div onClick={(e) => e.stopPropagation()}>
            <p className="text-white/50 mb-1">Creator</p>
            <ExplorerLink address={nft.creator} />
          </div>
          
          {nft.isListed && nft.price && (
            <div className="text-right">
              <p className="text-white/50 mb-1">Price</p>
              <p className="text-cyber-cyan font-bold">{formatPrice(nft.price)}</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default NFTCard;
