import { create } from 'zustand';

interface UIState {
  isMobileMenuOpen: boolean;
  isWalletModalOpen: boolean;
  toggleMobileMenu: () => void;
  openWalletModal: () => void;
  closeWalletModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isMobileMenuOpen: false,
  isWalletModalOpen: false,

  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  
  openWalletModal: () => set({ isWalletModalOpen: true }),
  
  closeWalletModal: () => set({ isWalletModalOpen: false }),
}));
