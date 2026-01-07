import axios from 'axios';
import type { NFT, Transaction } from '../types/index';
import { ethers } from 'ethers';

const API_BASE_URL = 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Backend response types
interface BackendNFT {
  id: number;
  token_id: number;
  token_uri: string;
  name: string;
  description: string;
  image_url: string;
  creator: string;
  owner: string;
  category: string;
  royalty_percent: number;
  is_listed: boolean;
  price: string | null;
  seller: string | null;
  is_burned: boolean;
  created_at: string;
  updated_at: string;
}

interface BackendTransaction {
  id: number;
  tx_hash: string;
  block_number: number;
  tx_type: string;
  token_id: number;
  from_address: string | null;
  to_address: string | null;
  price: string | null;
  timestamp: string;
  created_at: string;
}

interface NFTListResponse {
  total: number;
  items: BackendNFT[];
}

interface StatsResponse {
  total_nfts: number;
  total_listed: number;
  total_sold: number;
  total_volume: string;
  floor_price: string | null;
}

interface TransactionListResponse {
  total: number;
  items: BackendTransaction[];
}

// Helper function to convert scientific notation string to decimal string
const scientificToDecimal = (num: string): string => {
  // If not in scientific notation, return as is
  if (!num.includes('E') && !num.includes('e')) {
    return num;
  }
  
  // Parse scientific notation
  const [base, exponent] = num.split(/[eE]/);
  const exp = parseInt(exponent, 10);
  const baseNum = parseFloat(base);
  
  // Convert to decimal string without losing precision
  if (exp >= 0) {
    // Positive exponent: multiply
    const result = baseNum * Math.pow(10, exp);
    return result.toFixed(0);
  } else {
    // Negative exponent: divide
    return baseNum.toFixed(Math.abs(exp));
  }
};

// Transform functions
const transformNFT = (backendNFT: BackendNFT): NFT => {
  let price: number | undefined = undefined;
  
  if (backendNFT.price) {
    try {
      // Backend returns price as string (possibly in scientific notation like "1.0E+17")
      // Convert scientific notation to decimal string, then to BigNumber, then format to ether
      const priceDecimal = scientificToDecimal(backendNFT.price);
      const priceBN = ethers.BigNumber.from(priceDecimal);
      price = parseFloat(ethers.utils.formatEther(priceBN));
    } catch (error) {
      console.error('Error parsing price:', backendNFT.price, error);
    }
  }
  
  return {
    id: `nft-${backendNFT.token_id}`,
    tokenId: backendNFT.token_id,
    name: backendNFT.name,
    description: backendNFT.description,
    image: backendNFT.image_url,
    creator: backendNFT.creator,
    owner: backendNFT.owner,
    category: backendNFT.category,
    royalty: backendNFT.royalty_percent / 100, // Convert basis points to percentage
    price,
    isListed: backendNFT.is_listed,
    isBurned: backendNFT.is_burned,
    createdAt: backendNFT.created_at,
  };
};

const transformTransaction = (backendTx: BackendTransaction): Transaction => {
  let price = 0;
  
  if (backendTx.price) {
    try {
      const priceDecimal = scientificToDecimal(backendTx.price);
      const priceBN = ethers.BigNumber.from(priceDecimal);
      price = parseFloat(ethers.utils.formatEther(priceBN));
    } catch (error) {
      console.error('Error parsing transaction price:', backendTx.price, error);
    }
  }
  
  return {
    id: `tx-${backendTx.id}`,
    nftId: `nft-${backendTx.token_id}`,
    tokenId: backendTx.token_id,
    from: backendTx.from_address || '',
    to: backendTx.to_address || '',
    price,
    type: backendTx.tx_type === 'buy' ? 'sale' : backendTx.tx_type === 'list' ? 'sale' : backendTx.tx_type as any,
    txHash: backendTx.tx_hash,
    timestamp: new Date(backendTx.timestamp).getTime(),
  };
};

// NFT API
export const nftApi = {
  // 获取NFT列表
  list: async (params?: {
    skip?: number;
    limit?: number;
    category?: string;
    is_listed?: boolean;
    owner?: string;
    creator?: string;
    search?: string;
    sort_by?: string;
    sort_order?: string;
  }): Promise<{ total: number; items: NFT[] }> => {
    console.log('📡 API Request - GET /nfts with params:', params);
    const response = await api.get<NFTListResponse>('/nfts', { params });
    console.log('📡 API Response - GET /nfts:', response.data);
    const transformed = {
      total: response.data.total,
      items: response.data.items.map(transformNFT),
    };
    console.log('📡 Transformed data:', transformed);
    return transformed;
  },

  // 获取NFT详情
  get: async (tokenId: number): Promise<NFT> => {
    const response = await api.get<BackendNFT>(`/nfts/${tokenId}`);
    return transformNFT(response.data);
  },

  // 获取统计数据
  stats: async (): Promise<StatsResponse> => {
    const response = await api.get<StatsResponse>('/nfts/stats/summary');
    return response.data;
  },
};

// 交易API
export const transactionApi = {
  // 获取交易列表
  list: async (params?: {
    skip?: number;
    limit?: number;
    token_id?: number;
    tx_type?: string;
    address?: string;
  }): Promise<{ total: number; items: Transaction[] }> => {
    const response = await api.get<TransactionListResponse>('/transactions', { params });
    return {
      total: response.data.total,
      items: response.data.items.map(transformTransaction),
    };
  },
};

// 错误处理
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);
