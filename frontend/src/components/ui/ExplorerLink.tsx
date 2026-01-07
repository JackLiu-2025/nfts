import React from 'react';
import { ExternalLink } from 'lucide-react';
import CopyButton from './CopyButton';
import Tooltip from './Tooltip';

interface ExplorerLinkProps {
  address?: string;
  txHash?: string;
  showCopy?: boolean;
  className?: string;
}

const ExplorerLink: React.FC<ExplorerLinkProps> = ({
  address,
  txHash,
  showCopy = true,
  className = '',
}) => {
  const explorerUrl = import.meta.env.VITE_EXPLORER_URL || 'https://amoy.polygonscan.com';
  const value = address || txHash || '';
  const type = address ? 'address' : 'tx';
  const url = `${explorerUrl}/${type}/${value}`;
  
  // 截断显示
  const displayValue = value.length > 13 
    ? `${value.slice(0, 6)}...${value.slice(-4)}`
    : value;

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      <Tooltip content={value}>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-cyber-cyan hover:text-cyber-cyan/80 transition-colors inline-flex items-center gap-1 group"
        >
          <span>{displayValue}</span>
          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>
      </Tooltip>
      {showCopy && <CopyButton text={value} />}
    </div>
  );
};

export default ExplorerLink;
