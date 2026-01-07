import React from 'react';
import { useTranslation } from 'react-i18next';
import { Wallet } from 'lucide-react';
import { useUserStore } from '../../store/userStore';
import { useUIStore } from '../../store/uiStore';
import Button from '../ui/Button';
import ExplorerLink from '../ui/ExplorerLink';

const WalletButton: React.FC = () => {
  const { t } = useTranslation();
  const { address, isConnected, isConnecting, balance, disconnect } = useUserStore();
  const { openWalletModal } = useUIStore();

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-1 px-4 py-2 rounded-lg glass">
          <div>
            <p className="text-sm text-white/70">{parseFloat(balance).toFixed(4)} ETH</p>
            <ExplorerLink address={address} />
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={disconnect}
        >
          {t('wallet.disconnect')}
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={openWalletModal}
      loading={isConnecting}
      className="flex items-center gap-2"
    >
      <Wallet className="w-5 h-5" />
      {isConnecting ? t('wallet.connecting') : t('wallet.connect')}
    </Button>
  );
};

export default WalletButton;
