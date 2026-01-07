import { create } from 'zustand';
import { connectWallet, getCurrentAccount, getBalance, onAccountsChanged, onChainChanged, removeListeners } from '../services/web3';

interface UserState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  balance: string;
  connect: () => Promise<void>;
  disconnect: () => void;
  updateBalance: () => Promise<void>;
  init: () => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  address: null,
  isConnected: false,
  isConnecting: false,
  balance: '0',

  connect: async () => {
    set({ isConnecting: true });
    
    try {
      const address = await connectWallet();
      if (address) {
        const balance = await getBalance(address);
        set({
          address,
          isConnected: true,
          isConnecting: false,
          balance,
        });
        
        // Save to localStorage
        localStorage.setItem('walletConnected', 'true');
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      set({ isConnecting: false });
      throw error;
    }
  },

  disconnect: () => {
    set({
      address: null,
      isConnected: false,
      balance: '0',
    });
    
    // Remove from localStorage
    localStorage.removeItem('walletConnected');
  },

  updateBalance: async () => {
    const { address } = get();
    if (address) {
      const balance = await getBalance(address);
      set({ balance });
    }
  },

  init: async () => {
    // 检查是否已经连接
    const address = await getCurrentAccount();
    if (address) {
      const balance = await getBalance(address);
      set({
        address,
        isConnected: true,
        balance,
      });
    }

    // 监听账户变化
    onAccountsChanged(async (accounts) => {
      if (accounts.length === 0) {
        get().disconnect();
      } else {
        const balance = await getBalance(accounts[0]);
        set({
          address: accounts[0],
          isConnected: true,
          balance,
        });
      }
    });

    // 监听网络变化
    onChainChanged(() => {
      // 网络变化时重新加载页面
      window.location.reload();
    });
  },
}));

// 初始化Web3连接
if (typeof window !== 'undefined') {
  useUserStore.getState().init();
  
  // Auto-connect if previously connected
  const wasConnected = localStorage.getItem('walletConnected');
  if (wasConnected && window.ethereum) {
    useUserStore.getState().connect().catch(console.error);
  }
}
