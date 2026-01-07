# NFT Marketplace Smart Contracts

基于Polygon区块链的NFT市场智能合约。

## 功能特性

- ✅ NFT铸造 (ERC-721标准)
- ✅ NFT挂单出售
- ✅ NFT购买交易
- ✅ NFT销毁
- ✅ 版税机制 (最高10%)
- ✅ 市场手续费 (2.5%)
- ✅ 取消挂单
- ✅ 防重入攻击保护

## 技术栈

- Solidity ^0.8.20
- Hardhat
- OpenZeppelin Contracts
- Ethers.js v6

## 安装

```bash
npm install
```

## 配置

1. 复制环境变量示例文件：
```bash
cp .env.example .env
```

2. 编辑 `.env` 文件，填入你的配置：
   - `PRIVATE_KEY`: 你的钱包私钥
   - `POLYGON_AMOY_RPC_URL`: Polygon Amoy测试网RPC URL
   - `POLYGONSCAN_API_KEY`: Polygonscan API密钥（用于合约验证）

## 获取测试MATIC

访问 [Polygon Faucet](https://faucet.polygon.technology/) 获取测试网MATIC。

## 编译合约

```bash
npm run compile
```

## 运行测试

```bash
npm test
```

## 部署

### 部署到本地网络

```bash
npm run deploy:local
```

### 部署到Polygon Amoy测试网

```bash
npm run deploy:amoy
```

## 合约验证

部署后自动验证，或手动验证：

```bash
npx hardhat verify --network polygonAmoy <CONTRACT_ADDRESS>
```

## 合约接口

### 铸造NFT
```solidity
function mintNFT(
    string memory tokenURI,
    uint256 royaltyPercent,
    string memory category
) public returns (uint256)
```

### 挂单出售
```solidity
function listNFT(uint256 tokenId, uint256 price) public
```

### 购买NFT
```solidity
function buyNFT(uint256 tokenId) public payable
```

### 取消挂单
```solidity
function cancelListing(uint256 tokenId) public
```

### 销毁NFT
```solidity
function burnNFT(uint256 tokenId) public
```

### 查询NFT信息
```solidity
function getNFTInfo(uint256 tokenId) public view returns (
    address creator,
    uint256 royaltyPercent,
    string memory category,
    address owner,
    string memory tokenURI
)
```

### 查询挂单信息
```solidity
function getListing(uint256 tokenId) public view returns (
    uint256 price,
    address seller,
    bool isListed
)
```

## 费用结构

- **市场手续费**: 2.5% (从卖家收益中扣除)
- **版税**: 0-10% (由创作者设置，从卖家收益中扣除)
- **卖家收益**: 售价 - 市场手续费 - 版税

## 事件

- `NFTMinted`: NFT铸造时触发
- `NFTListed`: NFT挂单时触发
- `NFTSold`: NFT售出时触发
- `ListingCancelled`: 取消挂单时触发
- `NFTBurned`: NFT销毁时触发

## 安全特性

- ✅ ReentrancyGuard: 防止重入攻击
- ✅ Ownable: 合约所有权管理
- ✅ 输入验证: 所有参数都经过验证
- ✅ 权限检查: 只有所有者可以执行特定操作

## 网络信息

### Polygon Amoy Testnet
- Chain ID: 80002
- RPC URL: https://rpc-amoy.polygon.technology/
- Explorer: https://amoy.polygonscan.com/
- Faucet: https://faucet.polygon.technology/

## License

MIT
