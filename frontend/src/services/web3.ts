import { ethers } from 'ethers';
import NFTMarketplaceABI from '../contracts/NFTMarketplace.json';

// 网络配置
export const NETWORKS = {
  hardhat: {
    chainId: '0x539', // 1337 in hex
    chainName: 'Hardhat Local',
    rpcUrls: ['http://localhost:8545'],
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  polygonAmoy: {
    chainId: '0x13882', // 80002 in hex
    chainName: 'Polygon Amoy Testnet',
    rpcUrls: ['https://rpc-amoy.polygon.technology/'],
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    blockExplorerUrls: ['https://amoy.polygonscan.com/'],
  },
};

// 当前使用的网络（Polygon Amoy Testnet）
export const CURRENT_NETWORK = NETWORKS.polygonAmoy;

// 合约地址（从环境变量读取）
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

// 合约ABI（直接使用导入的数组）
export const CONTRACT_ABI = NFTMarketplaceABI;

// 获取Provider
export const getProvider = (): ethers.providers.Web3Provider | null => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.providers.Web3Provider(window.ethereum);
  }
  return null;
};

// 获取Signer
export const getSigner = async (): Promise<ethers.Signer | null> => {
  const provider = getProvider();
  if (!provider) return null;
  
  try {
    return provider.getSigner();
  } catch (error) {
    console.error('Error getting signer:', error);
    return null;
  }
};

// 获取合约实例（只读）
export const getContract = (): ethers.Contract | null => {
  const provider = getProvider();
  if (!provider) return null;
  
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
};

// 获取合约实例（可写）
export const getContractWithSigner = async (): Promise<ethers.Contract | null> => {
  const signer = await getSigner();
  if (!signer) return null;
  
  console.log('Creating contract with signer:', {
    address: CONTRACT_ADDRESS,
    network: CURRENT_NETWORK.chainName
  });
  
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
};

// 连接钱包
export const connectWallet = async (): Promise<string | null> => {
  if (!window.ethereum) {
    throw new Error('Please install MetaMask!');
  }

  try {
    // 请求账户访问
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    // 检查网络
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    
    // 如果不是目标网络，尝试切换
    if (chainId !== CURRENT_NETWORK.chainId) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: CURRENT_NETWORK.chainId }],
        });
      } catch (switchError: any) {
        // 如果网络不存在，添加网络
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [CURRENT_NETWORK],
          });
        } else {
          throw switchError;
        }
      }
    }

    return accounts[0];
  } catch (error) {
    console.error('Error connecting wallet:', error);
    throw error;
  }
};

// 获取当前账户
export const getCurrentAccount = async (): Promise<string | null> => {
  if (!window.ethereum) return null;

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_accounts',
    });
    return accounts[0] || null;
  } catch (error) {
    console.error('Error getting current account:', error);
    return null;
  }
};

// 获取账户余额
export const getBalance = async (address: string): Promise<string> => {
  const provider = getProvider();
  if (!provider) return '0';

  try {
    const balance = await provider.getBalance(address);
    return ethers.utils.formatEther(balance);
  } catch (error) {
    console.error('Error getting balance:', error);
    return '0';
  }
};

// 监听账户变化
export const onAccountsChanged = (callback: (accounts: string[]) => void) => {
  if (window.ethereum) {
    window.ethereum.on('accountsChanged', callback);
  }
};

// 监听网络变化
export const onChainChanged = (callback: (chainId: string) => void) => {
  if (window.ethereum) {
    window.ethereum.on('chainChanged', callback);
  }
};

// 移除监听器
export const removeListeners = () => {
  if (window.ethereum) {
    window.ethereum.removeAllListeners('accountsChanged');
    window.ethereum.removeAllListeners('chainChanged');
  }
};

// 类型声明
declare global {
  interface Window {
    ethereum?: any;
  }
}
