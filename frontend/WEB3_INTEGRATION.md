# Web3 集成文档

## ✅ 已完成

前端已成功集成智能合约！现在可以与本地Hardhat网络上的NFT Marketplace合约进行交互。

## 📋 集成内容

### 1. 合约配置
- ✅ 合约地址: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- ✅ 合约ABI: 已导入到 `frontend/src/contracts/NFTMarketplace.json`
- ✅ 网络: Hardhat本地网络 (Chain ID: 1337)

### 2. 服务层
创建了三个核心服务：

#### `services/web3.ts` - Web3基础服务
- 连接钱包 (MetaMask)
- 获取账户和余额
- 网络切换
- 监听账户/网络变化

#### `services/nft.ts` - NFT合约交互
- `mintNFT()` - 铸造NFT
- `listNFT()` - 挂单出售
- `buyNFT()` - 购买NFT
- `cancelListing()` - 取消挂单
- `burnNFT()` - 销毁NFT
- `getNFTInfo()` - 获取NFT信息
- `getListing()` - 获取挂单信息
- 事件监听 (铸造、挂单、售出等)

#### `services/ipfs.ts` - IPFS文件存储
- `uploadFileToIPFS()` - 上传文件
- `uploadJSONToIPFS()` - 上传元数据
- `uploadNFT()` - 完整NFT上传流程
- `ipfsToHttp()` - IPFS URL转换

### 3. 状态管理
更新了 `userStore.ts`:
- 真实的钱包连接
- 账户余额显示
- 自动重连
- 账户/网络变化监听

### 4. UI组件
更新了 `WalletButton.tsx`:
- 显示账户余额
- 显示账户地址
- 复制地址功能

## 🚀 使用方法

### 配置MetaMask

1. **添加Hardhat网络**
   - 打开MetaMask
   - 点击网络下拉菜单
   - 选择"添加网络"
   - 手动添加网络：
     - 网络名称: `Hardhat Local`
     - RPC URL: `http://localhost:8545`
     - Chain ID: `1337`
     - 货币符号: `ETH`

2. **导入测试账户**
   
   Hardhat提供了20个测试账户，每个账户有10000 ETH。
   
   **账户 #0** (推荐使用):
   - 地址: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
   - 私钥: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
   
   **账户 #1**:
   - 地址: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
   - 私钥: `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`
   
   **账户 #2**:
   - 地址: `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`
   - 私钥: `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a`

   导入步骤:
   - 打开MetaMask
   - 点击账户图标 → "导入账户"
   - 选择"私钥"
   - 粘贴上面的私钥
   - 点击"导入"

### 启动应用

1. **确保Hardhat节点正在运行**
   ```bash
   cd contracts
   npm run node
   ```

2. **启动前端**
   ```bash
   cd frontend
   npm run dev
   ```

3. **连接钱包**
   - 打开浏览器访问 http://localhost:5174
   - 点击"连接钱包"按钮
   - 选择MetaMask
   - 确认连接
   - 确保选择了"Hardhat Local"网络

### 测试功能

#### 1. 铸造NFT
```typescript
import { mintNFT } from './services/nft';
import { uploadNFT } from './services/ipfs';

// 上传图片和元数据
const tokenURI = await uploadNFT(
  file,           // 图片文件
  'My NFT',       // 名称
  'Description',  // 描述
);

// 铸造NFT
const { tokenId, transactionHash } = await mintNFT(
  tokenURI,       // IPFS URL
  5,              // 版税 5%
  'Art'           // 分类
);
```

#### 2. 挂单出售
```typescript
import { listNFT } from './services/nft';

const txHash = await listNFT(
  tokenId,  // NFT ID
  '0.1'     // 价格 (ETH)
);
```

#### 3. 购买NFT
```typescript
import { buyNFT } from './services/nft';

const txHash = await buyNFT(
  tokenId,  // NFT ID
  '0.1'     // 价格 (ETH)
);
```

#### 4. 取消挂单
```typescript
import { cancelListing } from './services/nft';

const txHash = await cancelListing(tokenId);
```

#### 5. 销毁NFT
```typescript
import { burnNFT } from './services/nft';

const txHash = await burnNFT(tokenId);
```

#### 6. 获取NFT信息
```typescript
import { getNFTInfo, getListing } from './services/nft';

// 获取NFT基本信息
const info = await getNFTInfo(tokenId);
// { creator, royaltyPercent, category, owner, uri }

// 获取挂单信息
const listing = await getListing(tokenId);
// { price, seller, isListed }
```

#### 7. 监听事件
```typescript
import { onNFTMinted, onNFTSold } from './services/nft';

// 监听铸造事件
const unsubscribe = onNFTMinted((tokenId, creator, tokenURI, royalty, category) => {
  console.log('New NFT minted:', tokenId);
});

// 监听售出事件
const unsubscribe2 = onNFTSold((tokenId, seller, buyer, price) => {
  console.log('NFT sold:', tokenId, 'for', price, 'ETH');
});

// 取消监听
unsubscribe();
unsubscribe2();
```

## 📝 注意事项

### IPFS配置（可选）

如果要使用真实的IPFS存储，需要配置Pinata：

1. 注册Pinata账号: https://pinata.cloud/
2. 获取API密钥
3. 在 `frontend/.env` 中配置：
   ```env
   VITE_PINATA_API_KEY=your_api_key
   VITE_PINATA_SECRET_KEY=your_secret_key
   VITE_PINATA_JWT=your_jwt_token
   ```

如果不配置，系统会使用模拟的IPFS URL进行测试。

### 网络切换

如果要切换到Polygon Amoy测试网：

1. 更新 `frontend/src/services/web3.ts`:
   ```typescript
   export const CURRENT_NETWORK = NETWORKS.polygonAmoy;
   ```

2. 更新合约地址为Amoy测试网部署的地址

3. 在MetaMask中添加Polygon Amoy网络

4. 获取测试MATIC代币

### Gas费用

- 本地Hardhat网络: 免费，无限ETH
- Polygon Amoy测试网: 需要测试MATIC
- Polygon主网: 需要真实MATIC

## 🔧 故障排除

### MetaMask连接失败
- 确保MetaMask已安装
- 确保选择了正确的网络 (Hardhat Local)
- 尝试刷新页面

### 交易失败
- 检查账户余额是否足够
- 检查Hardhat节点是否正在运行
- 查看浏览器控制台的错误信息

### 网络错误
- 确保Hardhat节点在 http://localhost:8545 运行
- 检查MetaMask网络配置是否正确
- 尝试重启Hardhat节点

## 🎯 下一步

现在合约已经集成，你可以：

1. **更新铸造页面** - 使用真实的合约调用替换mock数据
2. **更新市场页面** - 从合约读取真实的NFT列表
3. **更新详情页面** - 显示真实的NFT信息和挂单状态
4. **添加交易历史** - 监听合约事件显示交易记录
5. **开发后端API** - 创建FastAPI服务索引和缓存合约数据

## 📚 相关资源

- Hardhat文档: https://hardhat.org/
- Ethers.js文档: https://docs.ethers.org/
- MetaMask文档: https://docs.metamask.io/
- Pinata文档: https://docs.pinata.cloud/
- OpenZeppelin文档: https://docs.openzeppelin.com/
