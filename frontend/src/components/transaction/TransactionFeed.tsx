import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { Transaction } from '../../types/index';
import { transactionApi, nftApi } from '../../services/api';
import { formatRelativeTime } from '../../utils/format';
import { TrendingUp } from 'lucide-react';
import ExplorerLink from '../ui/ExplorerLink';

interface TransactionWithNFT extends Transaction {
  nftName?: string;
  nftImage?: string;
}

const TransactionFeed: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [transactions, setTransactions] = useState<TransactionWithNFT[]>([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await transactionApi.list({
          limit: 15,
        });
        
        // Fetch NFT details for each transaction
        const txWithNFTs = await Promise.all(
          response.items.map(async (tx) => {
            try {
              const nft = await nftApi.get(tx.tokenId);
              return {
                ...tx,
                nftName: nft.name,
                nftImage: nft.image,
              };
            } catch (error) {
              return {
                ...tx,
                nftName: `NFT #${tx.tokenId}`,
                nftImage: '',
              };
            }
          })
        );
        
        setTransactions(txWithNFTs);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };

    // Initial load
    fetchTransactions();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchTransactions();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="w-6 h-6 text-cyber-cyan" />
        <h2 className="text-2xl font-bold text-gradient">{t('home.recentActivity')}</h2>
      </div>

      <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
        {transactions.length === 0 ? (
          <p className="text-white/50 text-center py-8">{t('home.noActivity')}</p>
        ) : (
          transactions.map((tx, index) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-4 p-4 rounded-lg glass-hover"
            >
              {/* NFT Image */}
              {tx.nftImage && (
                <img
                  src={tx.nftImage}
                  alt={tx.nftName}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              )}

              {/* Transaction Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 flex-wrap">
                  <ExplorerLink address={tx.to} />
                  <span className="text-white/70">{t('transaction.bought')}</span>
                  <span className="text-cyber-cyan font-medium">{tx.nftName}</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <p className="text-sm text-white/50">
                    {formatRelativeTime(tx.timestamp, i18n.language)}
                  </p>
                  {tx.txHash && (
                    <>
                      <span className="text-white/30">•</span>
                      <ExplorerLink txHash={tx.txHash} showCopy={false} />
                    </>
                  )}
                </div>
              </div>

              {/* Price */}
              {tx.price > 0 && (
                <div className="text-right">
                  <p className="text-cyber-cyan font-bold">{tx.price.toFixed(3)} MATIC</p>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default TransactionFeed;
