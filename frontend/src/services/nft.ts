import { ethers } from 'ethers';
import { getContract, getContractWithSigner } from './web3';

// 铸造NFT
export const mintNFT = async (
  tokenURI: string,
  royaltyPercent: number,
  category: string
): Promise<{ tokenId: number; transactionHash: string }> => {
  const contract = await getContractWithSigner();
  if (!contract) throw new Error('Contract not available');

  try {
    console.log('Minting NFT with params:', {
      tokenURI,
      royaltyPercent,
      category,
      contractAddress: contract.address
    });

    // Check if wallet is connected
    const signer = await contract.signer.getAddress();
    console.log('Signer address:', signer);
    
    // Check network
    const network = await contract.provider.getNetwork();
    console.log('Network:', {
      name: network.name,
      chainId: network.chainId
    });
    
    // Estimate gas first
    try {
      const gasEstimate = await contract.estimateGas.mintNFT(tokenURI, royaltyPercent, category);
      console.log('Gas estimate:', gasEstimate.toString());
    } catch (gasError: any) {
      console.error('Gas estimation failed:', gasError);
      throw new Error(`Gas estimation failed: ${gasError.reason || gasError.message}`);
    }

    const tx = await contract.mintNFT(tokenURI, royaltyPercent, category);
    console.log('Transaction sent:', tx.hash);
    
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt);

    // 从事件中获取tokenId
    let tokenId: number | null = null;
    
    // 尝试从 events 数组中查找
    if (receipt.events && Array.isArray(receipt.events)) {
      const event = receipt.events.find((e: any) => e.event === 'NFTMinted');
      if (event && event.args) {
        tokenId = event.args[0].toNumber();
      }
    }
    
    // 如果没有找到，尝试从 logs 中解析
    if (tokenId === null && receipt.logs && Array.isArray(receipt.logs)) {
      try {
        for (const log of receipt.logs) {
          try {
            const parsedLog = contract.interface.parseLog(log);
            if (parsedLog.name === 'NFTMinted') {
              tokenId = parsedLog.args[0].toNumber();
              break;
            }
          } catch (e) {
            // 跳过无法解析的日志
            continue;
          }
        }
      } catch (error) {
        console.error('Error parsing logs:', error);
      }
    }
    
    if (tokenId !== null) {
      return {
        tokenId,
        transactionHash: receipt.transactionHash,
      };
    }

    throw new Error('NFTMinted event not found in transaction receipt');
  } catch (error: any) {
    console.error('Error minting NFT:', error);
    console.error('Error details:', {
      code: error.code,
      reason: error.reason,
      message: error.message,
      data: error.data
    });
    throw new Error(error.reason || error.message || 'Failed to mint NFT');
  }
};

// 挂单出售NFT
export const listNFT = async (
  tokenId: number,
  price: string
): Promise<{ transactionHash: string }> => {
  const contract = await getContractWithSigner();
  if (!contract) throw new Error('Contract not available');

  try {
    const priceInWei = ethers.utils.parseEther(price);
    const tx = await contract.listNFT(tokenId, priceInWei);
    const receipt = await tx.wait();
    return { transactionHash: receipt.transactionHash };
  } catch (error: any) {
    console.error('Error listing NFT:', error);
    throw new Error(error.reason || error.message || 'Failed to list NFT');
  }
};

// 购买NFT
export const buyNFT = async (
  tokenId: number,
  price: number
): Promise<{ transactionHash: string }> => {
  const contract = await getContractWithSigner();
  if (!contract) throw new Error('Contract not available');

  try {
    const priceInWei = ethers.utils.parseEther(price.toString());
    const tx = await contract.buyNFT(tokenId, { value: priceInWei });
    const receipt = await tx.wait();
    return { transactionHash: receipt.transactionHash };
  } catch (error: any) {
    console.error('Error buying NFT:', error);
    throw new Error(error.reason || error.message || 'Failed to buy NFT');
  }
};

// 取消挂单
export const cancelListing = async (tokenId: number): Promise<{ transactionHash: string }> => {
  const contract = await getContractWithSigner();
  if (!contract) throw new Error('Contract not available');

  try {
    const tx = await contract.cancelListing(tokenId);
    const receipt = await tx.wait();
    return { transactionHash: receipt.transactionHash };
  } catch (error: any) {
    console.error('Error canceling listing:', error);
    throw new Error(error.reason || error.message || 'Failed to cancel listing');
  }
};

// 销毁NFT
export const burnNFT = async (tokenId: number): Promise<{ transactionHash: string }> => {
  const contract = await getContractWithSigner();
  if (!contract) throw new Error('Contract not available');

  try {
    const tx = await contract.burnNFT(tokenId);
    const receipt = await tx.wait();
    return { transactionHash: receipt.transactionHash };
  } catch (error: any) {
    console.error('Error burning NFT:', error);
    throw new Error(error.reason || error.message || 'Failed to burn NFT');
  }
};

// 获取NFT信息
export const getNFTInfo = async (tokenId: number): Promise<{
  creator: string;
  royaltyPercent: number;
  category: string;
  owner: string;
  uri: string;
}> => {
  const contract = getContract();
  if (!contract) throw new Error('Contract not available');

  try {
    const result = await contract.getNFTInfo(tokenId);
    return {
      creator: result[0],
      royaltyPercent: result[1].toNumber(),
      category: result[2],
      owner: result[3],
      uri: result[4],
    };
  } catch (error: any) {
    console.error('Error getting NFT info:', error);
    throw new Error(error.reason || error.message || 'Failed to get NFT info');
  }
};

// 获取挂单信息
export const getListing = async (tokenId: number): Promise<{
  price: string;
  seller: string;
  isListed: boolean;
}> => {
  const contract = getContract();
  if (!contract) throw new Error('Contract not available');

  try {
    const result = await contract.getListing(tokenId);
    return {
      price: ethers.utils.formatEther(result[0]),
      seller: result[1],
      isListed: result[2],
    };
  } catch (error: any) {
    console.error('Error getting listing:', error);
    throw new Error(error.reason || error.message || 'Failed to get listing');
  }
};

// 获取总铸造数量
export const getTotalMinted = async (): Promise<number> => {
  const contract = getContract();
  if (!contract) throw new Error('Contract not available');

  try {
    const total = await contract.getTotalMinted();
    return total.toNumber();
  } catch (error: any) {
    console.error('Error getting total minted:', error);
    return 0;
  }
};

// 获取用户拥有的NFT数量
export const getBalanceOf = async (address: string): Promise<number> => {
  const contract = getContract();
  if (!contract) throw new Error('Contract not available');

  try {
    const balance = await contract.balanceOf(address);
    return balance.toNumber();
  } catch (error: any) {
    console.error('Error getting balance:', error);
    return 0;
  }
};

// 监听NFT铸造事件
export const onNFTMinted = (
  callback: (tokenId: number, creator: string, tokenURI: string, royaltyPercent: number, category: string) => void
) => {
  const contract = getContract();
  if (!contract) return () => {};

  const filter = contract.filters.NFTMinted();
  
  const listener = (tokenId: any, creator: string, tokenURI: string, royaltyPercent: any, category: string) => {
    callback(tokenId.toNumber(), creator, tokenURI, royaltyPercent.toNumber(), category);
  };

  contract.on(filter, listener);

  return () => {
    contract.off(filter, listener);
  };
};

// 监听NFT挂单事件
export const onNFTListed = (
  callback: (tokenId: number, seller: string, price: string) => void
) => {
  const contract = getContract();
  if (!contract) return () => {};

  const filter = contract.filters.NFTListed();
  
  const listener = (tokenId: any, seller: string, price: any) => {
    callback(tokenId.toNumber(), seller, ethers.utils.formatEther(price));
  };

  contract.on(filter, listener);

  return () => {
    contract.off(filter, listener);
  };
};

// 监听NFT售出事件
export const onNFTSold = (
  callback: (tokenId: number, seller: string, buyer: string, price: string) => void
) => {
  const contract = getContract();
  if (!contract) return () => {};

  const filter = contract.filters.NFTSold();
  
  const listener = (tokenId: any, seller: string, buyer: string, price: any) => {
    callback(tokenId.toNumber(), seller, buyer, ethers.utils.formatEther(price));
  };

  contract.on(filter, listener);

  return () => {
    contract.off(filter, listener);
  };
};

// 监听挂单取消事件
export const onListingCancelled = (
  callback: (tokenId: number, seller: string) => void
) => {
  const contract = getContract();
  if (!contract) return () => {};

  const filter = contract.filters.ListingCancelled();
  
  const listener = (tokenId: any, seller: string) => {
    callback(tokenId.toNumber(), seller);
  };

  contract.on(filter, listener);

  return () => {
    contract.off(filter, listener);
  };
};

// 监听NFT销毁事件
export const onNFTBurned = (
  callback: (tokenId: number, burner: string) => void
) => {
  const contract = getContract();
  if (!contract) return () => {};

  const filter = contract.filters.NFTBurned();
  
  const listener = (tokenId: any, burner: string) => {
    callback(tokenId.toNumber(), burner);
  };

  contract.on(filter, listener);

  return () => {
    contract.off(filter, listener);
  };
};
