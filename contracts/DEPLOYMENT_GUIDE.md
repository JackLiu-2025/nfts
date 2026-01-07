# NFT Marketplace 部署指南

## ✅ 已完成

- ✅ Hardhat项目初始化
- ✅ NFTMarketplace智能合约编写
- ✅ 12个测试用例全部通过
- ✅ 合约编译成功

## 📋 下一步：部署到Polygon Amoy测试网

### 1. 准备钱包

你需要一个MetaMask钱包，并获取私钥：

1. 打开MetaMask
2. 点击账户 → 账户详情 → 导出私钥
3. 输入密码获取私钥

⚠️ **警告**: 私钥非常重要，不要分享给任何人！

### 2. 获取测试MATIC

访问 Polygon Faucet 获取测试网MATIC：
- 🔗 https://faucet.polygon.technology/
- 选择 "Polygon Amoy"
- 输入你的钱包地址
- 点击 "Submit" 获取测试币

### 3. 配置环境变量

创建 `.env` 文件：

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入：

```env
# 你的钱包私钥（从MetaMask导出）
PRIVATE_KEY=your_private_key_here

# Polygon Amoy RPC URL（默认即可）
POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology/

# Polygonscan API Key（用于合约验证，可选）
# 从 https://polygonscan.com/myapikey 获取
POLYGONSCAN_API_KEY=your_api_key_here
```

### 4. 部署合约

```bash
npm run deploy:amoy
```

部署成功后，你会看到：
```
NFTMarketplace deployed to: 0x...
Network: polygonAmoy
Chain ID: 80002
```

### 5. 验证合约（可选）

如果你有Polygonscan API Key，合约会自动验证。

手动验证：
```bash
npx hardhat verify --network polygonAmoy <CONTRACT_ADDRESS>
```

### 6. 在Polygonscan上查看

访问：https://amoy.polygonscan.com/address/<CONTRACT_ADDRESS>

## 🔧 本地测试

### 启动本地节点

```bash
npm run node
```

### 部署到本地网络

```bash
npm run deploy:local
```

## 📊 合约信息

### 功能
- ✅ 铸造NFT (mintNFT)
- ✅ 挂单出售 (listNFT)
- ✅ 购买NFT (buyNFT)
- ✅ 取消挂单 (cancelListing)
- ✅ 销毁NFT (burnNFT)

### 费用
- 市场手续费: 2.5%
- 版税: 0-10% (创作者设置)

### Gas费用估算
- 铸造NFT: ~187,374 gas
- 挂单: ~70,468 gas
- 购买: ~95,137 gas
- 取消挂单: ~26,868 gas
- 销毁: ~46,775 gas

## 🔐 安全提示

1. ⚠️ 永远不要分享你的私钥
2. ⚠️ 不要将 `.env` 文件提交到Git
3. ⚠️ 测试网MATIC没有价值，但私钥可以用于主网
4. ✅ 使用专门的测试钱包
5. ✅ 在主网部署前进行充分测试

## 📝 测试结果

```
✔ Should mint a new NFT
✔ Should reject royalty above 10%
✔ Should reject empty token URI
✔ Should list an NFT for sale
✔ Should reject listing by non-owner
✔ Should cancel a listing
✔ Should buy a listed NFT
✔ Should reject insufficient payment
✔ Should reject buying own NFT
✔ Should burn an NFT
✔ Should reject burning by non-owner
✔ Should cancel listing when burning

12 passing (145ms)
```

## 🎯 接下来

部署成功后，你可以：

1. **集成前端** - 使用合约地址连接前端
2. **开发后端** - 创建API服务
3. **测试功能** - 在测试网上测试所有功能
4. **准备主网** - 充分测试后部署到Polygon主网

## 📚 相关链接

- Polygon Amoy Explorer: https://amoy.polygonscan.com/
- Polygon Faucet: https://faucet.polygon.technology/
- Hardhat文档: https://hardhat.org/
- OpenZeppelin文档: https://docs.openzeppelin.com/
