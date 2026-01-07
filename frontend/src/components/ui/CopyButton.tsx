import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
  showIcon?: boolean;
}

const CopyButton: React.FC<CopyButtonProps> = ({ 
  text, 
  label, 
  className = '',
  showIcon = true 
}) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(t('toast.copied'));
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error(t('toast.copyFailed'));
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-white/10 transition-colors ${className}`}
      title={label || t('common.copy')}
    >
      {showIcon && (
        copied ? (
          <Check className="w-4 h-4 text-cyber-green" />
        ) : (
          <Copy className="w-4 h-4 text-white/50 hover:text-white" />
        )
      )}
      {label && <span className="text-sm">{label}</span>}
    </button>
  );
};

export default CopyButton;
