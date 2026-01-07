export type NFT = {
  id: string;
  tokenId: number;
  name: string;
  description: string;
  image: string;
  creator: string;
  owner: string;
  category: string;
  royalty: number;
  price?: number;
  isListed: boolean;
  isBurned: boolean;
  createdAt: string;
};

export type Listing = {
  id: string;
  nftId: string;
  tokenId: number;
  seller: string;
  price: number;
  isActive: boolean;
  createdAt: string;
};

export type Transaction = {
  id: string;
  nftId: string;
  tokenId: number;
  from: string;
  to: string;
  price: number;
  type: 'mint' | 'sale' | 'transfer' | 'burn';
  txHash: string;
  timestamp: number;
  nftName?: string;
  nftImage?: string;
};

export type User = {
  address: string;
  nonce?: string;
};

export type NFTFilters = {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
};

export type PaginationParams = {
  page: number;
  limit: number;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pages: number;
};

export type Language = 'zh' | 'ja' | 'en';

export type ToastType = 'success' | 'error' | 'warning' | 'info';
