# NFT 生命周期完整指南

## 概述

本文档详细说明了NFT从铸造到销毁的完整生命周期，以及每个阶段的操作和价格设置。

## NFT 生命周期阶段

### 1. 铸造（Mint）

**位置**: `/mint` 页面

**操作**: 创建新的NFT

**需要设置的信息**:
- ✅ 图片（必填）
- ✅ 名称（必填）
- ✅ 描述（可选）
- ✅ 分类（必填）
- ✅ 版税比例（必填，0-10%）
- ❌ **价格（不需要）**

**为什么铸造时不设置价格？**
- 铸造只是创建NFT，此时NFT归创建者所有
- NFT还没有挂单出售，所以不需要价格
- 创建者可以选择自己持有、赠送或稍后挂单出售

**智能合约函数**: `mintNFT(tokenURI, royaltyPercent, category)`

**结果**:
- NFT被创建并归创建者所有
- `isListed = false`（未挂单）
- `price = null`（无价格）
- `owner = creator`（拥有者是创建者）

---

### 2. 挂单（List）

**位置**: NFT详情页面（`/nft/:id`）

**条件**: 
- 必须是NFT的拥有者
- NFT未被挂单（`isListed = false`）
- NFT未被销毁

**操作**: 设置价格并挂单出售

**需要设置的信息**:
- ✅ **价格（必填，0.001 - 1,000,000 MATIC）**

**智能合约函数**: `listNFT(tokenId, price)`

**结果**:
- NFT被挂单到市场
- `isListed = true`（已挂单）
- `price = 设置的价格`
- `seller = owner`（卖家是当前拥有者）
- NFT出现在市场页面（`/marketplace`）

---

### 3. 购买（Buy）

**位置**: NFT详情页面（`/nft/:id`）

**条件**:
- 不是NFT的拥有者
- NFT已被挂单（`isListed = true`）
- 有足够的MATIC余额

**操作**: 购买已挂单的NFT

**智能合约函数**: `buyNFT(tokenId)` + 发送价格对应的MATIC

**结果**:
- NFT所有权转移给买家
- `owner = buyer`（拥有者变为买家）
- `isListed = false`（自动取消挂单）
- `price = null`（价格清空）
- 卖家收到MATIC（扣除市场费用和版税）
- 创建者收到版税
- 市场收到手续费（2.5%）

---

### 4. 取消挂单（Cancel Listing）

**位置**: NFT详情页面（`/nft/:id`）

**条件**:
- 必须是NFT的拥有者
- NFT已被挂单（`isListed = true`）

**操作**: 取消挂单，NFT不再出售

**智能合约函数**: `cancelListing(tokenId)`

**结果**:
- NFT从市场下架
- `isListed = false`（取消挂单）
- `price = null`（价格清空）
- `seller = null`（卖家信息清空）
- NFT仍归拥有者所有

---

### 5. 销毁（Burn）

**位置**: NFT详情页面（`/nft/:id`）

**条件**:
- 必须是NFT的拥有者
- 不可逆操作，需要确认

**操作**: 永久销毁NFT

**智能合约函数**: `burnNFT(tokenId)`

**结果**:
- NFT被永久销毁
- `isBurned = true`（已销毁）
- `isListed = false`（自动取消挂单）
- NFT不再显示在任何列表中
- 无法恢复

---

## 价格设置总结

| 阶段 | 是否需要价格 | 说明 |
|------|-------------|------|
| 铸造（Mint） | ❌ 不需要 | 只是创建NFT，还没有出售意图 |
| 挂单（List） | ✅ 需要 | 设置出售价格，NFT上架市场 |
| 购买（Buy） | - | 使用挂单时设置的价格 |
| 取消挂单（Cancel） | - | 价格被清空 |
| 销毁（Burn） | - | NFT被永久销毁 |

## 完整流程示例

### 场景1：创建并出售NFT

1. **Alice 铸造NFT**
   - 上传图片，设置名称、描述、分类、版税5%
   - ❌ 不设置价格
   - 结果：NFT #1 创建，Alice是拥有者

2. **Alice 挂单出售**
   - 在NFT详情页点击"List"
   - ✅ 设置价格：10 MATIC
   - 结果：NFT #1 出现在市场，价格10 MATIC

3. **Bob 购买NFT**
   - 在市场或NFT详情页点击"Buy"
   - 支付10 MATIC
   - 结果：
     - Bob成为新拥有者
     - Alice收到9.5 MATIC（10 - 2.5%手续费 - 5%版税）
     - Alice收到0.5 MATIC版税（因为她是创建者）
     - 市场收到0.25 MATIC手续费

4. **Bob 重新挂单**
   - Bob在NFT详情页点击"List"
   - 设置新价格：15 MATIC
   - 结果：NFT #1 重新上架，价格15 MATIC

### 场景2：创建但不出售

1. **Alice 铸造NFT**
   - 创建NFT #2
   - ❌ 不设置价格

2. **Alice 保留NFT**
   - 不挂单，NFT只在Alice的个人中心显示
   - 其他人无法购买

3. **Alice 稍后决定出售**
   - 随时可以在NFT详情页挂单
   - 设置价格并上架

## 前端页面对应关系

| 页面 | 路径 | 显示的NFT | 价格显示 |
|------|------|----------|---------|
| 铸造页面 | `/mint` | - | ❌ 无价格输入 |
| 市场页面 | `/marketplace` | 所有已挂单的NFT | ✅ 显示挂单价格 |
| 首页 | `/` | 精选NFT | ✅ 显示挂单价格（如果已挂单） |
| 个人中心 | `/profile` | 我创建的/我拥有的NFT | ✅ 显示挂单价格（如果已挂单） |
| NFT详情 | `/nft/:id` | 单个NFT详情 | ✅ 显示挂单价格（如果已挂单） |

## 常见问题

### Q: 为什么铸造时不能设置价格？

A: 这是标准的NFT市场设计：
- 铸造（Mint）= 创建NFT
- 挂单（List）= 出售NFT
- 分离这两个操作让用户有更多灵活性
- 用户可以先创建NFT，稍后决定是否出售以及以什么价格出售

### Q: 如果我想铸造后立即出售怎么办？

A: 需要两步操作：
1. 在铸造页面创建NFT
2. 铸造成功后，跳转到个人中心
3. 点击NFT进入详情页
4. 点击"List"按钮设置价格并挂单

### Q: 我可以修改已挂单NFT的价格吗？

A: 可以，有两种方式：
1. 取消挂单，然后重新挂单并设置新价格
2. 或者我们可以添加"修改价格"功能（需要智能合约支持）

### Q: 版税是如何计算的？

A: 
- 版税在铸造时设置（0-10%）
- 每次NFT被出售时，创建者都会收到版税
- 例如：版税5%，售价10 MATIC
  - 买家支付：10 MATIC
  - 市场手续费：0.25 MATIC（2.5%）
  - 创建者版税：0.5 MATIC（5%）
  - 卖家收到：9.25 MATIC

## 技术实现

### 智能合约函数

```solidity
// 铸造 - 不需要价格
function mintNFT(string memory tokenURI, uint256 royaltyPercent, string memory category) 
    external returns (uint256)

// 挂单 - 需要价格
function listNFT(uint256 tokenId, uint256 price) external

// 购买 - 使用挂单价格
function buyNFT(uint256 tokenId) external payable

// 取消挂单 - 清空价格
function cancelListing(uint256 tokenId) external

// 销毁
function burnNFT(uint256 tokenId) external
```

### 前端服务函数

```typescript
// services/nft.ts
export const mintNFT = async (tokenURI: string, royaltyPercent: number, category: string)
export const listNFT = async (tokenId: number, price: string)
export const buyNFT = async (tokenId: number, price: string)
export const cancelListing = async (tokenId: number)
export const burnNFT = async (tokenId: number)
```

## 总结

NFT的价格设置是在**挂单（List）阶段**，而不是铸造阶段。这种设计：

✅ 符合标准NFT市场的最佳实践
✅ 给用户更多灵活性
✅ 分离创建和销售的关注点
✅ 允许用户持有NFT而不必立即出售

如果您想要铸造后立即出售，只需要在铸造成功后立即进入NFT详情页进行挂单操作即可。
