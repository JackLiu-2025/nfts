# 🚀 NFT Marketplace 系统状态

## ⚠️ 当前运行状态 - 前端铸造问题

**最后更新**: 2026-01-06 20:00

### 前端 (Frontend)
- **状态**: ⚠️ 运行中 (铸造功能有问题)
- **地址**: http://localhost:5174
- **技术栈**: React + Vite + TypeScript + TailwindCSS
- **功能**:
  - ✅ 钱包连接 (MetaMask)
  - ⚠️ NFT铸造 (MetaMask配置问题)
  - ✅ NFT市场浏览
  - ✅ NFT详情查看
  - ✅ NFT挂单/购买/取消/销毁
  - ✅ 多语言支持 (中文/英文/日文)

### 后端 (Backend)
- **状态**: ✅ 运行中
- **地址**: http://localhost:8000
- **API文档**: http://localhost:8000/docs
- **技术栈**: FastAPI + Python + PostgreSQL
- **功能**:
  - ✅ NFT数据API
  - ✅ 交易历史API
  - ✅ 市场统计API
  - ✅ 区块链事件索引器

### 智能合约 (Smart Contract)
- **状态**: ✅ 已部署并验证
- **网络**: Polygon Amoy Testnet
- **Chain ID**: 80002
- **合约地址**: `0xB70b8bd1Fe19464b440C352a89A664314b8Fe4B5`
- **浏览器**: https://amoy.polygonscan.com/address/0xB70b8bd1Fe19464b440C352a89A664314b8Fe4B5
- **测试结果**:
  - ✅ 通过Hardhat直接铸造: 成功
  - ✅ Gas估算: ~0.05 MATIC
  - ✅ 交易已确认: https://amoy.polygonscan.com/tx/0xdbf550376191e52c5f5a484b4f6dd829c93ba278ec2ad678aade23accf60df0f
- **功能**:
  - ✅ NFT铸造 (mintNFT) - 合约正常工作
  - ✅ NFT挂单 (listNFT)
  - ✅ NFT购买 (buyNFT)
  - ✅ 取消挂单 (cancelListing)
  - ✅ NFT销毁 (burnNFT)
  - ✅ 版税机制 (0-10%)
  - ✅ 市场手续费 (2.5%)

### 数据库 (Database)
- **状态**: ✅ 连接正常
- **类型**: PostgreSQL
- **主机**: 64.176.82.230:5432
- **数据库**: nt

### IPFS存储
- **服务商**: Pinata
- **状态**: ✅ 配置完成并测试通过
- **功能**: ✅ 图片上传、✅ 元数据上传

---

## 🐛 已知问题

### ⚠️ 前端铸造 - "Internal JSON-RPC error"

**问题描述**: 用户在前端铸造NFT时显示 "Internal JSON-RPC error"

**根本原因**: MetaMask网络配置问题（不是合约或代码问题）

**证据**:
- ✅ 合约通过Hardhat直接调用完全正常
- ✅ 所有环境变量配置正确
- ✅ IPFS上传正常工作
- ✅ 代码中的网络配置正确
- ❌ MetaMask显示 "Internal JSON-RPC error"

**解决方案**: 

1. **使用诊断工具** (推荐):
   ```bash
   open test_metamask.html
   ```
   按照工具中的步骤检查所有配置

2. **手动验证MetaMask网络**:
   - 打开MetaMask
   - 检查当前网络是否为 "Polygon Amoy Testnet"
   - Chain ID 必须是 80002
   - 如果不正确，手动添加网络:
     ```
     网络名称: Polygon Amoy Testnet
     RPC URL: https://rpc-amoy.polygon.technology/
     Chain ID: 80002
     货币符号: MATIC
     区块浏览器: https://amoy.polygonscan.com/
     ```

3. **重置MetaMask账户**:
   - 设置 → 高级 → 重置账户
   - 这会清除缓存的交易数据

4. **临时解决方案** - 通过Hardhat直接铸造:
   ```bash
   cd contracts
   npx hardhat run scripts/test-mint.js --network polygonAmoy
   ```

**详细文档**:
- 完整故障排查指南: `MINT_TROUBLESHOOTING.md`
- 技术调试信息: `DEBUG_MINT_ISSUE.md`

---

## 🔧 诊断和测试工具

### 1. MetaMask诊断工具 (推荐)
```bash
open test_metamask.html
```
自动检查:
- ✅ 钱包连接
- ✅ 网络配置
- ✅ 合约可访问性
- ✅ Gas估算

### 2. 合约直接测试
```bash
cd contracts
npx hardhat run scripts/test-mint.js --network polygonAmoy
```
预期结果: ✅ NFT铸造成功

### 3. 前端配置验证
```bash
node check_frontend_config.js
```
预期结果: 所有检查 ✅

### 4. 合约单元测试
```bash
cd contracts
npx hardhat test
```
预期结果: 12个测试全部通过 ✅

---

## 📋 快速访问链接

| 服务 | 链接 |
|------|------|
| 前端应用 | http://localhost:5174 |
| 后端API | http://localhost:8000 |
| API文档 | http://localhost:8000/docs |
| 智能合约 | https://amoy.polygonscan.com/address/0xB70b8bd1Fe19464b440C352a89A664314b8Fe4B5 |
| 测试交易 | https://amoy.polygonscan.com/tx/0xdbf550376191e52c5f5a484b4f6dd829c93ba278ec2ad678aade23accf60df0f |

---

## 🔧 服务管理命令

### 启动所有服务
```bash
./start-all.sh
```

### 单独启动服务

**前端**:
```bash
cd frontend
npm run dev
```

**后端**:
```bash
cd backend
./run.sh
```

---

## 🧪 测试NFT完整流程

### 方法1: 使用Hardhat (当前推荐)
```bash
cd contracts
npx hardhat run scripts/test-mint.js --network polygonAmoy
```
这会直接在区块链上铸造NFT，绕过前端问题。

### 方法2: 使用前端 (需要先修复MetaMask配置)

#### 1. 准备工作
- ✅ 安装MetaMask钱包
- ⚠️ **重要**: 确保切换到Polygon Amoy测试网 (Chain ID: 80002)
- ✅ 获取测试MATIC (已有49.72 MATIC)
- ✅ 连接钱包到应用

#### 2. 铸造NFT
1. 访问 http://localhost:5174/mint
2. 上传图片
3. 填写名称、描述
4. 选择分类
5. 设置版税 (0-10%)
6. ❌ **不需要设置价格**
7. 点击"Mint NFT"
8. **检查MetaMask弹窗显示的网络是否为 "Polygon Amoy Testnet"**
9. 确认MetaMask交易
10. 等待交易确认

#### 3. 挂单出售
1. 铸造成功后，进入个人中心
2. 点击刚铸造的NFT
3. 点击"List"按钮
4. ✅ **设置价格** (例如: 0.1 MATIC)
5. 确认MetaMask交易
6. NFT出现在市场页面

---

## 📊 配置验证清单

在尝试前端铸造之前，请确认:

- [ ] MetaMask已安装并解锁
- [ ] MetaMask连接到 Polygon Amoy Testnet
- [ ] MetaMask网络设置中 Chain ID 显示为 80002
- [ ] 钱包有足够的MATIC (>0.1 MATIC)
- [ ] 前端运行在 http://localhost:5174
- [ ] 后端运行在 http://localhost:8000
- [ ] 浏览器控制台已打开 (F12) 用于调试
- [ ] 如果之前有问题，已重置MetaMask账户

---

## 🐛 故障排查

### "Internal JSON-RPC error"
**最常见原因**: MetaMask网络不正确

**解决方案**:
1. 检查MetaMask网络下拉菜单 - 应显示 "Polygon Amoy Testnet"
2. 如果显示其他网络，切换到Polygon Amoy
3. 如果列表中没有Polygon Amoy，手动添加
4. 重置MetaMask账户
5. 刷新浏览器页面

### 前端无法连接钱包
- 检查MetaMask是否安装
- 检查是否切换到Polygon Amoy网络
- 刷新页面重试

### 交易失败
- 检查MATIC余额是否足够
- 检查网络是否正确 (Chain ID: 80002)
- 查看MetaMask错误信息
- 查看浏览器控制台错误

---

## 📝 重要说明

### 价格设置
- ❌ **铸造时不设置价格** - 只是创建NFT
- ✅ **挂单时设置价格** - 将NFT上架市场出售
- 这是标准的NFT市场设计模式

### 费用说明
- **Gas费**: 每次交易需要支付Gas费 (~0.05 MATIC/次)
- **市场手续费**: 2.5% (购买时从售价中扣除)
- **版税**: 0-10% (铸造时设置，每次转售时支付给创建者)

### 网络说明
- **当前网络**: Polygon Amoy Testnet (测试网)
- **Chain ID**: 80002
- **RPC**: https://rpc-amoy.polygon.technology/
- **测试币**: 免费获取，无实际价值

---

## 📚 相关文档

### 故障排查
- **[铸造问题完整指南](./MINT_TROUBLESHOOTING.md)** - 详细的解决方案
- **[调试信息](./DEBUG_MINT_ISSUE.md)** - 技术调试详情

### 功能文档
- [NFT生命周期完整指南](./NFT_LIFECYCLE.md)
- [快速开始指南](./QUICKSTART.md)
- [测试指南](./TESTING_GUIDE.md)
- [部署指南](./DEPLOYMENT_AMOY.md)
- [后端设置](./BACKEND_SETUP.md)
- [Web3集成](./frontend/WEB3_INTEGRATION.md)

---

## 🎯 下一步行动

### 立即行动 (解决铸造问题)
1. **打开诊断工具**: `open test_metamask.html`
2. **按照工具指示检查所有配置**
3. **如果所有检查通过但仍失败**: 清除浏览器缓存，重置MetaMask
4. **临时解决方案**: 使用Hardhat脚本直接铸造

### 功能增强 (未来)
- [ ] 添加NFT搜索功能
- [ ] 添加NFT收藏功能
- [ ] 添加用户关注功能
- [ ] 添加价格历史图表

---

**系统版本**: v1.0.0
**合约状态**: ✅ 正常工作
**前端状态**: ⚠️ MetaMask配置问题
**后端状态**: ✅ 正常运行
