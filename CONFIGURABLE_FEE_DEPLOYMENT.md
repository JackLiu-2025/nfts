# 可配置平台费用功能部署总结

## 部署时间
2026-01-07

## 功能概述

实现了可配置的平台费用功能，允许合约所有者（owner）动态调整平台费率和开关费用收取。

## 新增功能

### 1. 可配置费率
- **默认费率**: 2.5% (250 basis points)
- **最大费率**: 10% (1000 basis points)
- **调整函数**: `setMarketplaceFee(uint256 newFeePercent)`
- **权限**: 仅合约 owner 可调用

### 2. 费用开关
- **默认状态**: 启用 (true)
- **控制函数**: `setFeesEnabled(bool enabled)`
- **权限**: 仅合约 owner 可调用
- **效果**: 关闭后，买家支付的全部金额归卖家（扣除版税后）

### 3. 查询函数
- **函数**: `getMarketplaceFeeConfig()`
- **返回值**: 
  - `feePercent`: 当前费率
  - `enabled`: 是否启用
  - `maxFeePercent`: 最大费率限制

### 4. 新增事件
- `MarketplaceFeeUpdated(uint256 oldFeePercent, uint256 newFeePercent)`: 费率变更时触发
- `FeesEnabledChanged(bool enabled)`: 费用开关变更时触发

## 合约部署信息

### 旧合约（已废弃）
- **地址**: `0xB70b8bd1Fe19464b440C352a89A664314b8Fe4B5`
- **特点**: 硬编码 2.5% 费率，无法调整

### 新合约（当前使用）
- **地址**: `0x4681BE5B76bACF483Ec7d6f228f6F4C31394c761`
- **网络**: Polygon Amoy Testnet (Chain ID: 80002)
- **部署者**: `0x19C360231E261666CDB30f213cd76877f48bD21e`
- **区块浏览器**: https://amoy.polygonscan.com/address/0x4681BE5B76bACF483Ec7d6f228f6F4C31394c761
- **部署区块**: ~31865887

## 测试结果

所有 19 个测试用例通过：
- ✅ 3 个铸造测试
- ✅ 3 个挂单测试
- ✅ 3 个购买测试
- ✅ 3 个销毁测试
- ✅ 7 个费用管理测试（新增）

### 费用管理测试覆盖
1. 默认费率验证 (2.5%)
2. Owner 可以修改费率
3. 拒绝超过最大费率的设置
4. 拒绝非 owner 修改费率
5. Owner 可以关闭费用
6. 关闭费用后不收取平台费
7. 启用费用时正确收取费率

## 配置更新

### 前端配置 (frontend/.env)
```env
VITE_CONTRACT_ADDRESS=0x4681BE5B76bACF483Ec7d6f228f6F4C31394c761
```

### 后端配置 (backend/.env)
```env
CONTRACT_ADDRESS=0x4681BE5B76bACF483Ec7d6f228f6F4C31394c761
INDEXER_START_BLOCK=31865887
```

### 合约 ABI
- 已更新 `frontend/src/contracts/NFTMarketplace.json`
- 包含新增的函数和事件定义

## 使用示例

### 查询当前费用配置
```javascript
const config = await contract.getMarketplaceFeeConfig();
console.log('费率:', config.feePercent / 100, '%');
console.log('是否启用:', config.enabled);
console.log('最大费率:', config.maxFeePercent / 100, '%');
```

### 修改费率（仅 owner）
```javascript
// 设置为 5%
await contract.setMarketplaceFee(500);

// 设置为 0% (不收费)
await contract.setMarketplaceFee(0);
```

### 关闭/开启费用（仅 owner）
```javascript
// 关闭费用
await contract.setFeesEnabled(false);

// 开启费用
await contract.setFeesEnabled(true);
```

## 费用计算逻辑

购买 NFT 时的资金分配：
```
总价格 = 买家支付金额
平台费 = feesEnabled ? (总价格 × marketplaceFeePercent / 10000) : 0
版税费 = 总价格 × 创作者版税比例 / 10000
卖家收益 = 总价格 - 平台费 - 版税费
```

### 示例计算
假设 NFT 售价 1 ETH，创作者版税 5%，平台费 2.5%：
- 平台费: 1 × 0.025 = 0.025 ETH → 合约 owner
- 版税费: 1 × 0.05 = 0.05 ETH → 创作者
- 卖家收益: 1 - 0.025 - 0.05 = 0.925 ETH → 卖家

如果关闭平台费：
- 平台费: 0 ETH
- 版税费: 1 × 0.05 = 0.05 ETH → 创作者
- 卖家收益: 1 - 0 - 0.05 = 0.95 ETH → 卖家

## 安全特性

1. **最大费率限制**: 10%，防止恶意设置过高费率
2. **权限控制**: 只有合约 owner 可以修改费用配置
3. **事件记录**: 所有费用变更都有链上事件记录，透明可追溯
4. **向后兼容**: 现有功能不受影响，只是增加了配置能力

## 后续步骤

1. ✅ 合约部署完成
2. ✅ 前端配置更新
3. ✅ 后端配置更新
4. ⏳ 重启后端服务（需要手动执行）
5. ⏳ 重启前端服务（需要手动执行）
6. ⏳ 测试新合约功能

## 注意事项

⚠️ **重要**: 这是新合约部署，旧合约上的 NFT 数据不会迁移。这是测试网环境，数据丢失不影响生产。

⚠️ **数据库**: 后端索引器会从新的起始区块开始扫描，旧的 NFT 数据会保留在数据库中，但不会再更新。建议清空数据库重新开始。

## 管理员操作指南

作为合约 owner (`0x19C360231E261666CDB30f213cd76877f48bD21e`)，你可以：

1. **调整平台费率**: 根据市场情况和运营需求调整（0-10%）
2. **临时关闭费用**: 在促销活动期间可以关闭平台费
3. **监控费用收入**: 通过区块链浏览器查看 owner 地址收到的费用

所有操作都需要通过 MetaMask 或其他钱包签名交易。
