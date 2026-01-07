import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Sparkles, Palette, ArrowRight, Gamepad2, Music } from 'lucide-react';
import Button from '../components/ui/Button';
import NFTGrid from '../components/nft/NFTGrid';
import TransactionFeed from '../components/transaction/TransactionFeed';
import { nftApi } from '../services/api';
import type { NFT } from '../types/index';

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [featuredNFTs, setFeaturedNFTs] = useState<NFT[]>([]);

  useEffect(() => {
    const fetchFeaturedNFTs = async () => {
      try {
        const response = await nftApi.list({
          is_listed: true,
          limit: 8,
          sort_by: 'created_at',
          sort_order: 'desc',
        });
        setFeaturedNFTs(response.items);
      } catch (error) {
        console.error('Error fetching featured NFTs:', error);
      }
    };

    fetchFeaturedNFTs();
  }, []);

  const categories = [
    { 
      icon: Palette, 
      name: t('marketplace.art'), 
      gradient: 'from-purple-500 via-pink-500 to-purple-600',
      count: '2.5K+',
      description: 'Digital artworks'
    },
    { 
      icon: Sparkles, 
      name: t('marketplace.collectible'), 
      gradient: 'from-blue-500 via-cyan-500 to-blue-600',
      count: '1.8K+',
      description: 'Rare collectibles'
    },
    { 
      icon: Gamepad2, 
      name: t('marketplace.gaming'), 
      gradient: 'from-yellow-500 via-orange-500 to-red-500',
      count: '3.2K+',
      description: 'Gaming assets'
    },
    { 
      icon: Music, 
      name: t('marketplace.music'), 
      gradient: 'from-green-500 via-emerald-500 to-teal-500',
      count: '890+',
      description: 'Music & Audio'
    },
  ];

  return (
    <div className="relative">
      {/* Animated Background Grid */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 245, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 245, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }} />
        
        {/* Floating Orbs */}
        <motion.div
          className="absolute top-20 left-10 w-96 h-96 bg-cyber-blue/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-cyber-purple/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="text-center mb-32 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-cyber-cyan/30 mb-8"
            >
              <Sparkles className="w-4 h-4 text-cyber-cyan" />
              <span className="text-sm text-cyber-cyan font-medium">Powered by Polygon</span>
            </motion.div>

            <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight">
              <motion.span 
                className="block text-gradient"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {t('home.hero.title')}
              </motion.span>
              <motion.span 
                className="block text-white mt-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {t('home.hero.subtitle')}
              </motion.span>
            </h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-white/60 mb-12 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {t('home.hero.description')}
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row items-center justify-center gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                size="lg"
                onClick={() => navigate('/marketplace')}
                className="w-full sm:w-auto text-lg px-8 py-4 inline-flex items-center justify-center gap-2 group"
              >
                <span>{t('home.hero.explore')}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate('/mint')}
                className="w-full sm:w-auto text-lg px-8 py-4"
              >
                {t('home.hero.create')}
              </Button>
            </motion.div>
          </motion.div>

          {/* Floating particles */}
          <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-cyber-cyan rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -50, 0],
                  opacity: [0, 0.8, 0],
                  scale: [0, 1.5, 0],
                }}
                transition={{
                  duration: 3 + Math.random() * 3,
                  repeat: Infinity,
                  delay: Math.random() * 3,
                }}
              />
            ))}
          </div>
        </section>

        {/* Categories Section - Redesigned */}
        <section className="mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gradient mb-4">
              {t('home.categories')}
            </h2>
            <p className="text-white/60 text-lg">Explore diverse digital assets</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                onClick={() => navigate('/marketplace')}
                className="group relative cursor-pointer"
              >
                {/* Glow effect on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 rounded-2xl`} />
                
                {/* Card */}
                <div className="relative glass rounded-2xl p-8 border border-white/10 group-hover:border-white/30 transition-all duration-300 h-full">
                  {/* Icon with gradient background */}
                  <div className="relative mb-6">
                    <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-20 blur-lg rounded-2xl`} />
                    <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${category.gradient} flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                      <category.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-white group-hover:text-gradient transition-all">
                      {category.name}
                    </h3>
                    <p className="text-white/50 text-sm">
                      {category.description}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <span className="text-cyber-cyan font-bold text-lg">
                        {category.count}
                      </span>
                      <ArrowRight className="w-5 h-5 text-white/30 group-hover:text-cyber-cyan group-hover:translate-x-2 transition-all" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Featured NFTs */}
        <section className="mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-12"
          >
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gradient mb-2">
                {t('home.featuredNFTs')}
              </h2>
              <p className="text-white/60">Handpicked exclusive collections</p>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate('/marketplace')}
              className="hidden md:flex items-center gap-2 group"
            >
              View All
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
          <NFTGrid nfts={featuredNFTs} />
        </section>

        {/* Recent Activity */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gradient mb-2">
              {t('home.recentActivity')}
            </h2>
            <p className="text-white/60">Live marketplace transactions</p>
          </motion.div>
          <TransactionFeed />
        </section>
      </div>
    </div>
  );
};

export default HomePage;
