// Pinata配置
const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY || '';
const PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_SECRET_KEY || '';
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT || '';

// 上传文件到IPFS (Pinata)
export const uploadFileToIPFS = async (file: File): Promise<string> => {
  console.log('Pinata configuration:', {
    hasJWT: !!PINATA_JWT,
    hasAPIKey: !!PINATA_API_KEY,
    hasSecretKey: !!PINATA_SECRET_KEY
  });

  if (!PINATA_JWT && !PINATA_API_KEY) {
    // 如果没有配置Pinata，返回模拟的IPFS URL
    console.warn('Pinata not configured, using mock IPFS URL');
    return `ipfs://Qm${Math.random().toString(36).substring(2, 15)}`;
  }

  try {
    console.log('Uploading file to Pinata:', file.name, file.size, 'bytes');
    
    const formData = new FormData();
    formData.append('file', file);

    const metadata = JSON.stringify({
      name: file.name,
    });
    formData.append('pinataMetadata', metadata);

    const options = JSON.stringify({
      cidVersion: 0,
    });
    formData.append('pinataOptions', options);

    const headers: HeadersInit = PINATA_JWT
      ? { Authorization: `Bearer ${PINATA_JWT}` }
      : {
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_KEY,
        };

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers,
      body: formData,
    });

    console.log('Pinata file upload response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Pinata error response:', errorText);
      throw new Error(`Failed to upload file to IPFS: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('File uploaded to IPFS:', data.IpfsHash);
    return `ipfs://${data.IpfsHash}`;
  } catch (error) {
    console.error('Error uploading file to IPFS:', error);
    throw error;
  }
};

// 上传JSON元数据到IPFS
export const uploadJSONToIPFS = async (json: object): Promise<string> => {
  if (!PINATA_JWT && !PINATA_API_KEY) {
    // 如果没有配置Pinata，返回模拟的IPFS URL
    console.warn('Pinata not configured, using mock IPFS URL');
    return `ipfs://Qm${Math.random().toString(36).substring(2, 15)}`;
  }

  try {
    console.log('Uploading JSON to Pinata:', json);
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(PINATA_JWT
        ? { Authorization: `Bearer ${PINATA_JWT}` }
        : {
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_SECRET_KEY,
          }),
    };

    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers,
      body: JSON.stringify(json),
    });

    console.log('Pinata JSON upload response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Pinata error response:', errorText);
      throw new Error(`Failed to upload JSON to IPFS: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('JSON uploaded to IPFS:', data.IpfsHash);
    return `ipfs://${data.IpfsHash}`;
  } catch (error) {
    console.error('Error uploading JSON to IPFS:', error);
    throw error;
  }
};

// 将IPFS URL转换为HTTP URL
export const ipfsToHttp = (ipfsUrl: string): string => {
  if (!ipfsUrl) return '';
  
  if (ipfsUrl.startsWith('ipfs://')) {
    const hash = ipfsUrl.replace('ipfs://', '');
    return `https://gateway.pinata.cloud/ipfs/${hash}`;
  }
  
  if (ipfsUrl.startsWith('Qm')) {
    return `https://gateway.pinata.cloud/ipfs/${ipfsUrl}`;
  }
  
  return ipfsUrl;
};

// 创建NFT元数据
export const createNFTMetadata = (
  name: string,
  description: string,
  imageUrl: string,
  attributes?: Array<{ trait_type: string; value: string | number }>
) => {
  return {
    name,
    description,
    image: imageUrl,
    attributes: attributes || [],
  };
};

// 上传NFT（图片 + 元数据）
export const uploadNFT = async (
  file: File,
  name: string,
  description: string,
  attributes?: Array<{ trait_type: string; value: string | number }>
): Promise<string> => {
  try {
    // 1. 上传图片
    const imageUrl = await uploadFileToIPFS(file);

    // 2. 创建元数据
    const metadata = createNFTMetadata(name, description, imageUrl, attributes);

    // 3. 上传元数据
    const metadataUrl = await uploadJSONToIPFS(metadata);

    return metadataUrl;
  } catch (error) {
    console.error('Error uploading NFT:', error);
    throw error;
  }
};

// 从IPFS获取JSON数据
export const fetchFromIPFS = async (ipfsUrl: string): Promise<any> => {
  try {
    const httpUrl = ipfsToHttp(ipfsUrl);
    const response = await fetch(httpUrl);
    
    if (!response.ok) {
      throw new Error('Failed to fetch from IPFS');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching from IPFS:', error);
    throw error;
  }
};
