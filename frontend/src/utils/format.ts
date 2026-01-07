// Format wallet address to masked format (0x1234...5678)
export const maskAddress = (address: string): string => {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Format price with MATIC symbol
export const formatPrice = (price: number): string => {
  return `${price.toFixed(3)} MATIC`;
};

// Format relative time (e.g., "2 minutes ago")
export const formatRelativeTime = (timestamp: number, locale: string = 'en'): string => {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  const translations: Record<string, Record<string, string>> = {
    en: {
      justNow: 'Just now',
      secondsAgo: 'seconds ago',
      minuteAgo: 'minute ago',
      minutesAgo: 'minutes ago',
      hourAgo: 'hour ago',
      hoursAgo: 'hours ago',
      dayAgo: 'day ago',
      daysAgo: 'days ago',
    },
    zh: {
      justNow: '刚刚',
      secondsAgo: '秒前',
      minuteAgo: '分钟前',
      minutesAgo: '分钟前',
      hourAgo: '小时前',
      hoursAgo: '小时前',
      dayAgo: '天前',
      daysAgo: '天前',
    },
    ja: {
      justNow: 'たった今',
      secondsAgo: '秒前',
      minuteAgo: '分前',
      minutesAgo: '分前',
      hourAgo: '時間前',
      hoursAgo: '時間前',
      dayAgo: '日前',
      daysAgo: '日前',
    },
  };
  
  const t = translations[locale] || translations.en;
  
  if (seconds < 10) return t.justNow;
  if (seconds < 60) return `${seconds} ${t.secondsAgo}`;
  if (minutes === 1) return `1 ${t.minuteAgo}`;
  if (minutes < 60) return `${minutes} ${t.minutesAgo}`;
  if (hours === 1) return `1 ${t.hourAgo}`;
  if (hours < 24) return `${hours} ${t.hoursAgo}`;
  if (days === 1) return `1 ${t.dayAgo}`;
  return `${days} ${t.daysAgo}`;
};

// Format date
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Validate file type
export const validateFileType = (file: File): boolean => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return allowedTypes.includes(file.type);
};

// Validate file size (max 10MB)
export const validateFileSize = (file: File): boolean => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  return file.size <= maxSize;
};

// Validate price range
export const validatePrice = (price: number): boolean => {
  return price >= 0.001 && price <= 1000000;
};

// Validate NFT name
export const validateNFTName = (name: string): boolean => {
  return name.length >= 1 && name.length <= 100;
};

// Validate NFT description
export const validateNFTDescription = (description: string): boolean => {
  return description.length <= 1000;
};

// Validate royalty percentage
export const validateRoyalty = (royalty: number): boolean => {
  return royalty >= 0 && royalty <= 10;
};

// Copy to clipboard
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy:', error);
    return false;
  }
};

// Generate random ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};
