import React, { useState } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute z-50 px-3 py-2 text-xs text-white bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-xl border border-white/10 whitespace-nowrap bottom-full left-1/2 transform -translate-x-1/2 mb-2 pointer-events-none animate-fade-in">
          <div className="font-mono">{content}</div>
          {/* 箭头 */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2">
            <div className="border-[6px] border-transparent border-t-gray-900/95"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;
