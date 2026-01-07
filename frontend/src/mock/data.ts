import type { NFT, Transaction } from '../types/index';

// Mock NFT images (using placeholder images)
const mockImages = [
  'https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?w=500',
  'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=500',
  'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=500',
  'https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=500',
  'https://images.unsplash.com/photo-1643101809204-6fb869816dbe?w=500',
  'https://images.unsplash.com/photo-1642104704074-907c0698cbd9?w=500',
  'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=500',
  'https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=500',
];

// Mock wallet addresses
const mockAddresses = [
  '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199',
  '0xdD2FD4581271e230360230F9337D5c0430Bf44C0',
  '0xbDA5747bFD65F08deb54cb465eB87D40e51B197E',
  '0x2546BcD3c84621e976D8185a91A922aE77ECEc30',
];

// Generate mock NFTs
export const mockNFTs: NFT[] = Array.from({ length: 24 }, (_, i) => ({
  id: `nft-${i + 1}`,
  tokenId: i + 1,
  name: `Cyber Punk #${i + 1}`,
  description: `A unique digital artwork from the Cyber Punk collection. This piece represents the fusion of technology and art in the Web3 era.`,
  image: mockImages[i % mockImages.length],
  creator: mockAddresses[i % mockAddresses.length],
  owner: i % 3 === 0 ? mockAddresses[0] : mockAddresses[(i + 1) % mockAddresses.length],
  category: ['art', 'collectible', 'gaming', 'music'][i % 4],
  royalty: (i % 10) + 1,
  price: i % 2 === 0 ? Math.random() * 10 + 0.5 : undefined,
  isListed: i % 2 === 0,
  isBurned: false,
  createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
}));

// Generate mock transactions
export const mockTransactions: Transaction[] = Array.from({ length: 20 }, (_, i) => {
  const nft = mockNFTs[i % mockNFTs.length];
  return {
    id: `tx-${i + 1}`,
    nftId: nft.id,
    tokenId: nft.tokenId,
    from: mockAddresses[(i + 1) % mockAddresses.length],
    to: mockAddresses[i % mockAddresses.length],
    price: Math.random() * 10 + 0.5,
    type: 'sale' as const,
    txHash: `0x${Math.random().toString(16).substring(2, 66)}`,
    timestamp: Date.now() - Math.random() * 24 * 60 * 60 * 1000,
    nftName: nft.name,
    nftImage: nft.image,
  };
});

// Mock current user address
export const mockUserAddress = mockAddresses[0];

// Helper function to get user's created NFTs
export const getUserCreatedNFTs = (address: string): NFT[] => {
  return mockNFTs.filter(nft => nft.creator.toLowerCase() === address.toLowerCase());
};

// Helper function to get user's collected NFTs
export const getUserCollectedNFTs = (address: string): NFT[] => {
  return mockNFTs.filter(
    nft => nft.owner.toLowerCase() === address.toLowerCase() && 
           nft.creator.toLowerCase() !== address.toLowerCase()
  );
};

// Helper function to get user's listed NFTs
export const getUserListedNFTs = (address: string): NFT[] => {
  return mockNFTs.filter(
    nft => nft.owner.toLowerCase() === address.toLowerCase() && nft.isListed
  );
};

// Helper function to get marketplace NFTs
export const getMarketplaceNFTs = (): NFT[] => {
  return mockNFTs.filter(nft => nft.isListed && !nft.isBurned);
};

// Helper function to filter NFTs
export const filterNFTs = (
  nfts: NFT[],
  filters: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
  }
): NFT[] => {
  return nfts.filter(nft => {
    if (filters.category && nft.category !== filters.category) return false;
    if (filters.minPrice && (!nft.price || nft.price < filters.minPrice)) return false;
    if (filters.maxPrice && (!nft.price || nft.price > filters.maxPrice)) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        nft.name.toLowerCase().includes(searchLower) ||
        nft.description.toLowerCase().includes(searchLower) ||
        nft.creator.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });
};

// Helper function to get NFT by ID
export const getNFTById = (id: string): NFT | undefined => {
  return mockNFTs.find(nft => nft.id === id);
};

// Helper function to get NFT transactions
export const getNFTTransactions = (nftId: string): Transaction[] => {
  return mockTransactions.filter(tx => tx.nftId === nftId);
};
