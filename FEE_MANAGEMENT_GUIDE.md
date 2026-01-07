# NFT 市场平台费用管理指南

## 概述

你的 NFT 市场现在支持可配置的平台费用功能。作为合约所有者，你可以：
- ✅ 动态调整平台费率（0-10%）
- ✅ 随时开启或关闭费用收取
- ✅ 查看当前费用配置

## 快速开始

### 1. 查看当前费用配置

```bash
cd contracts
npx hardhat run scripts/test-fee-config.js --network polygonAmoy
```

输出示例：
```
📊 Current Fee Configuration:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Fee Percentage:     2.5% (250 basis points)
Fees Enabled:       ✅ Yes
Max Fee Allowed:    10% (1000 basis points)
```

### 2. 管理费用（交互式工具）

```bash
cd contracts
npx hardhat run scripts/manage-fees.js --network polygonAmoy
```

这个工具提供友好的交互界面，让你可以：
1. 修改费率百分比
2. 开启/关闭费用
3. 查看当前配置

## 合约信息

- **合约地址**: `0x4681BE5B76bACF483Ec7d6f228f6F4C31394c761`
- **网络**: Polygon Amoy Testnet
- **所有者**: `0x19C360231E261666CDB30f213cd76877f48bD21e`
- **浏览器**: https://amoy.polygonscan.com/address/0x4681BE5B76bACF483Ec7d6f228f6F4C31394c761

## 费用配置说明

### 默认配置
- **费率**: 2.5%
- **状态**: 启用
- **最大限制**: 10%

### 费率计算
费率使用"基点"（basis points）表示：
- 1% = 100 基点
- 2.5% = 250 基点
- 5% = 500 基点
- 10% = 1000 基点

### 资金分配示例

假设一个 NFT 以 **1 MATIC** 的价格售出，创作者版税为 **5%**：

#### 场景 1: 平台费 2.5%（默认）
```
总价格:     1.0000 MATIC
平台费:     0.0250 MATIC (2.5%) → 合约所有者
创作者版税: 0.0500 MATIC (5%)   → NFT 创作者
卖家收益:   0.9250 MATIC        → NFT 卖家
```

#### 场景 2: 平台费 5%
```
总价格:     1.0000 MATIC
平台费:     0.0500 MATIC (5%)   → 合约所有者
创作者版税: 0.0500 MATIC (5%)   → NFT 创作者
卖家收益:   0.9000 MATIC        → NFT 卖家
```

#### 场景 3: 平台费关闭
```
总价格:     1.0000 MATIC
平台费:     0.0000 MATIC (0%)   → 无
创作者版税: 0.0500 MATIC (5%)   → NFT 创作者
卖家收益:   0.9500 MATIC        → NFT 卖家
```

## 使用场景

### 场景 1: 调整费率以提高竞争力
如果发现其他市场的费率更低，你可以降低费率：

```bash
# 运行管理工具
npx hardhat run scripts/manage-fees.js --network polygonAmoy

# 选择: 1. Change fee percentage
# 输入: 2 (表示 2%)
```

### 场景 2: 促销活动期间免费
在特殊活动期间，可以临时关闭平台费：

```bash
# 运行管理工具
npx hardhat run scripts/manage-fees.js --network polygonAmoy

# 选择: 2. Enable/Disable fees
# 选择: 2. Disable fees
```

活动结束后记得重新开启：
```bash
# 选择: 2. Enable/Disable fees
# 选择: 1. Enable fees
```

### 场景 3: 根据市场情况动态调整
- **市场冷清时**: 降低费率（如 1-2%）吸引更多交易
- **市场火热时**: 提高费率（如 3-5%）增加收入
- **测试阶段**: 设为 0% 鼓励用户测试

## 通过代码调用

如果你想通过代码直接调用合约函数：

### 使用 Hardhat Console

```bash
cd contracts
npx hardhat console --network polygonAmoy
```

然后在控制台中：

```javascript
// 获取合约实例
const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
const contract = NFTMarketplace.attach("0x4681BE5B76bACF483Ec7d6f228f6F4C31394c761");

// 查看当前配置
const config = await contract.getMarketplaceFeeConfig();
console.log("Fee:", Number(config.feePercent) / 100, "%");
console.log("Enabled:", config.enabled);

// 修改费率为 3%
await contract.setMarketplaceFee(300);

// 关闭费用
await contract.setFeesEnabled(false);

// 开启费用
await contract.setFeesEnabled(true);
```

### 使用 ethers.js（前端）

```javascript
import { ethers } from 'ethers';
import NFTMarketplaceABI from './contracts/NFTMarketplace.json';

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const contract = new ethers.Contract(
  "0x4681BE5B76bACF483Ec7d6f228f6F4C31394c761",
  NFTMarketplaceABI,
  signer
);

// 查看配置
const config = await contract.getMarketplaceFeeConfig();
console.log('当前费率:', Number(config.feePercent) / 100, '%');

// 修改费率（需要是 owner）
const tx = await contract.setMarketplaceFee(500); // 5%
await tx.wait();
```

## 监控费用收入

### 方法 1: 区块链浏览器
访问你的钱包地址查看收到的费用：
https://amoy.polygonscan.com/address/0x19C360231E261666CDB30f213cd76877f48bD21e

### 方法 2: 监听事件
合约会发出事件记录所有费用变更：

```javascript
// 监听费率变更事件
contract.on("MarketplaceFeeUpdated", (oldFee, newFee) => {
  console.log(`费率从 ${oldFee/100}% 变更为 ${newFee/100}%`);
});

// 监听费用开关事件
contract.on("FeesEnabledChanged", (enabled) => {
  console.log(`费用${enabled ? '已开启' : '已关闭'}`);
});

// 监听 NFT 售出事件（包含费用信息）
contract.on("NFTSold", (tokenId, seller, buyer, price) => {
  console.log(`NFT #${tokenId} 以 ${ethers.utils.formatEther(price)} MATIC 售出`);
});
```

## 安全提示

⚠️ **重要安全事项**：

1. **保护私钥**: 只有合约所有者可以修改费用，确保私钥安全
2. **谨慎调整**: 频繁修改费率可能影响用户信任
3. **透明沟通**: 重大费率变更应提前通知用户
4. **合理范围**: 建议费率保持在 1-5% 之间，与行业标准一致
5. **测试先行**: 在测试网充分测试后再在主网操作

## 行业参考

主流 NFT 市场的平台费率：
- **OpenSea**: 2.5%
- **Rarible**: 2.5%
- **LooksRare**: 2%
- **X2Y2**: 0.5%
- **Blur**: 0%（通过其他方式盈利）

## 故障排除

### 问题 1: "You are not the contract owner"
**原因**: 当前钱包不是合约所有者
**解决**: 切换到部署合约的钱包（0x19C360231E261666CDB30f213cd76877f48bD21e）

### 问题 2: "Fee exceeds maximum"
**原因**: 尝试设置超过 10% 的费率
**解决**: 费率必须在 0-10% 之间

### 问题 3: 交易失败
**原因**: Gas 费不足或网络问题
**解决**: 
- 确保钱包有足够的 MATIC
- 检查网络连接
- 稍后重试

## 下一步

1. ✅ 合约已部署并配置完成
2. ⏳ 重启后端服务以使用新合约
3. ⏳ 重启前端服务以使用新合约
4. ⏳ 测试完整的 NFT 交易流程
5. ⏳ 根据需要调整费率

## 技术支持

如有问题，请查看：
- 合约代码: `contracts/contracts/NFTMarketplace.sol`
- 测试用例: `contracts/test/NFTMarketplace.test.js`
- 部署信息: `CONFIGURABLE_FEE_DEPLOYMENT.md`
