import React from 'react';
import { useTranslation } from 'react-i18next';
import { useUserStore } from '../../store/userStore';
import { useUIStore } from '../../store/uiStore';
import Modal from '../ui/Modal';
import toast from 'react-hot-toast';

const WalletModal: React.FC = () => {
  const { t } = useTranslation();
  const { connect } = useUserStore();
  const { isWalletModalOpen, closeWalletModal } = useUIStore();

  const handleConnect = async (walletType: 'metamask' | 'walletconnect') => {
    try {
      await connect();
      toast.success(t('toast.walletConnected'));
      closeWalletModal();
    } catch (error) {
      toast.error('Failed to connect wallet');
    }
  };

  const wallets = [
    {
      id: 'metamask' as const,
      name: 'MetaMask',
      icon: '🦊',
      description: 'Connect with MetaMask wallet',
    },
    {
      id: 'walletconnect' as const,
      name: 'WalletConnect',
      icon: '🔗',
      description: 'Connect with WalletConnect',
    },
  ];

  return (
    <Modal
      isOpen={isWalletModalOpen}
      onClose={closeWalletModal}
      title={t('wallet.selectWallet')}
      size="sm"
    >
      <div className="space-y-3">
        {wallets.map((wallet) => (
          <button
            key={wallet.id}
            onClick={() => handleConnect(wallet.id)}
            className="w-full p-4 rounded-lg glass-hover text-left flex items-center gap-4 group"
          >
            <div className="text-4xl">{wallet.icon}</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold group-hover:text-gradient transition-all">
                {wallet.name}
              </h3>
              <p className="text-sm text-white/50">{wallet.description}</p>
            </div>
          </button>
        ))}
      </div>
    </Modal>
  );
};

export default WalletModal;
