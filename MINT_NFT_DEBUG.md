# NFT 铸造调试指南

## 问题诊断

### 已修复的问题

1. **网络配置错误**
   - ❌ 之前：`web3.ts` 中 `CURRENT_NETWORK` 设置为 `hardhat`
   - ✅ 现在：已更新为 `polygonAmoy`

2. **合约地址错误**
   - ❌ 之前：`NFTMarketplace.json` 中的地址是本地 Hardhat 地址 `0x5FbDB2315678afecb367f032d93F642f64180aa3`
   - ✅ 现在：已更新为 Amoy 测试网地址 `0xB70b8bd1Fe19464b440C352a89A664314b8Fe4B5`

3. **环境变量优先级**
   - ✅ `web3.ts` 现在优先使用环境变量 `VITE_CONTRACT_ADDRESS`
   - ✅ 如果环境变量不存在，则使用 JSON 文件中的地址

## 测试步骤

### 1. 检查前端配置

打开浏览器控制台（F12），查看以下信息：

```javascript
// 检查合约地址
console.log('Contract Address:', import.meta.env.VITE_CONTRACT_ADDRESS);

// 检查网络配置
console.log('Chain ID:', import.meta.env.VITE_CHAIN_ID);
console.log('RPC URL:', import.meta.env.VITE_RPC_URL);
```

预期输出：
```
Contract Address: 0xB70b8bd1Fe19464b440C352a89A664314b8Fe4B5
Chain ID: 80002
RPC URL: https://rpc-amoy.polygon.technology/
```

### 2. 检查 MetaMask 配置

确保 MetaMask 已正确配置：

- **网络名称**: Polygon Amoy Testnet
- **Chain ID**: 80002
- **RPC URL**: https://rpc-amoy.polygon.technology/
- **货币符号**: MATIC
- **区块浏览器**: https://amoy.polygonscan.com/

### 3. 检查钱包余额

确保钱包有足够的测试 MATIC：

- 铸造 NFT 需要 Gas 费（通常 0.01-0.05 MATIC）
- 建议至少有 0.1 MATIC

### 4. 测试铸造流程

1. **访问铸造页面**
   - URL: http://localhost:5174/mint

2. **填写表单**
   - 上传图片（JPG, PNG, GIF, WEBP，最大 10MB）
   - 名称：1-100 字符
   - 描述：最多 1000 字符
   - 分类：art, collectible, gaming, music
   - 版税：0-10%（例如：5）

3. **点击 "Mint NFT"**

4. **查看控制台输出**

应该看到以下日志：

```
Creating contract with signer: {
  address: "0xB70b8bd1Fe19464b440C352a89A664314b8Fe4B5",
  network: "Polygon Amoy Testnet"
}

Minting NFT with params: {
  tokenURI: "ipfs://...",
  royaltyPercent: 500,  // 5% = 500 基点
  category: "art",
  contractAddress: "0xB70b8bd1Fe19464b440C352a89A664314b8Fe4B5"
}

Transaction sent: 0x...
Transaction confirmed: {...}
```

5. **确认 MetaMask 交易**
   - 检查 Gas 费用
   - 点击"确认"

6. **等待交易确认**
   - 通常需要 5-30 秒
   - 可以在 https://amoy.polygonscan.com/ 查看交易状态

## 常见错误及解决方案

### Error: "Internal JSON-RPC error"

**可能原因**：

1. **网络不匹配**
   - 检查 MetaMask 是否连接到 Polygon Amoy Testnet
   - Chain ID 必须是 80002

2. **合约地址错误**
   - 检查 `frontend/src/contracts/NFTMarketplace.json` 中的地址
   - 应该是 `0xB70b8bd1Fe19464b440C352a89A664314b8Fe4B5`

3. **Gas 不足**
   - 检查钱包余额
   - 获取测试 MATIC: https://faucet.polygon.technology/

4. **参数验证失败**
   - 版税必须 ≤ 10%（1000 基点）
   - tokenURI 不能为空
   - category 不能为空

### Error: "Failed to fetch"

**可能原因**：

1. **RPC 连接失败**
   - 检查网络连接
   - 尝试切换 RPC URL

2. **MetaMask 未连接**
   - 点击"Connect Wallet"
   - 授权网站访问钱包

### Error: "Contract not available"

**可能原因**：

1. **未连接钱包**
   - 确保 MetaMask 已连接

2. **合约地址未配置**
   - 检查环境变量 `VITE_CONTRACT_ADDRESS`

## 调试命令

### 检查前端环境变量

```bash
cat frontend/.env
```

应该看到：
```
VITE_CONTRACT_ADDRESS=0xB70b8bd1Fe19464b440C352a89A664314b8Fe4B5
VITE_CHAIN_ID=80002
VITE_RPC_URL=https://rpc-amoy.polygon.technology/
```

### 检查合约 JSON 文件

```bash
head -3 frontend/src/contracts/NFTMarketplace.json
```

应该看到：
```json
{
  "address": "0xB70b8bd1Fe19464b440C352a89A664314b8Fe4B5",
  "abi": [
```

### 重启前端服务

如果修改了配置文件，需要重启前端：

```bash
# 停止前端（Ctrl+C）
# 重新启动
cd frontend
npm run dev
```

## 验证铸造成功

### 1. 检查交易

访问区块浏览器：
```
https://amoy.polygonscan.com/tx/[交易哈希]
```

应该看到：
- Status: Success ✅
- From: 你的钱包地址
- To: 合约地址 (0xB70b8bd1Fe19464b440C352a89A664314b8Fe4B5)
- Logs: NFTMinted 事件

### 2. 检查后端索引

等待 15 秒后，访问：
```
http://localhost:8000/api/nfts
```

应该能看到新铸造的 NFT。

### 3. 检查前端显示

访问个人中心：
```
http://localhost:5174/profile
```

应该能看到新铸造的 NFT。

## 参数说明

### royaltyPercent（版税百分比）

- **前端输入**: 0-10（百分比）
- **传递给合约**: 0-1000（基点）
- **转换公式**: `Math.floor(parseFloat(royalty) * 100)`
- **示例**:
  - 输入 5% → 传递 500 基点
  - 输入 2.5% → 传递 250 基点
  - 输入 10% → 传递 1000 基点

### category（分类）

支持的分类：
- `art` - 艺术品
- `collectible` - 收藏品
- `gaming` - 游戏
- `music` - 音乐

### tokenURI（元数据 URI）

格式：`ipfs://[CID]`

示例：`ipfs://QmX7Kn8VvZqQ9YzJxR5nN8vP2wT3mL4sH6fG9dC1bA2eF3`

## 成功标志

铸造成功后，你应该看到：

1. ✅ MetaMask 显示交易成功
2. ✅ 前端显示成功提示，包含 Token ID
3. ✅ 自动跳转到个人中心
4. ✅ 个人中心显示新铸造的 NFT
5. ✅ 后端 API 返回新 NFT 数据
6. ✅ 区块浏览器显示交易成功

## 下一步

铸造成功后，你可以：

1. **查看 NFT 详情**
   - 点击 NFT 卡片
   - 查看元数据、图片、版税等信息

2. **挂单出售**
   - 在 NFT 详情页点击 "List"
   - 设置价格（0.001 - 1,000,000 MATIC）
   - 确认交易

3. **转移 NFT**
   - 使用 MetaMask 或其他钱包
   - 转移到其他地址

4. **销毁 NFT**
   - 在 NFT 详情页点击 "Burn"
   - 确认警告
   - 永久销毁 NFT

## 技术支持

如果仍然遇到问题：

1. 清除浏览器缓存
2. 重启 MetaMask
3. 检查控制台错误日志
4. 查看后端日志
5. 在区块浏览器验证合约地址

---

**最后更新**: 2026-01-06 19:45
**合约地址**: 0xB70b8bd1Fe19464b440C352a89A664314b8Fe4B5
**网络**: Polygon Amoy Testnet (Chain ID: 80002)
