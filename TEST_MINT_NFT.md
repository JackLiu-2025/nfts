# 🎨 测试铸造 NFT

## 当前状态

✅ **合约已部署**: `0xB70b8bd1Fe19464b440C352a89A664314b8Fe4B5`  
✅ **前端运行中**: http://localhost:5174  
✅ **后端运行中**: http://localhost:8000  
✅ **索引器正常**: 正在扫描区块  
✅ **数据库连接**: 正常  

⚠️ **数据库为空**: 因为还没有铸造任何 NFT

## 📝 测试步骤

### 1. 准备钱包

1. 打开 MetaMask
2. 确保切换到 **Polygon Amoy Testnet**
3. 如果没有该网络，添加网络：
   - **网络名称**: Polygon Amoy Testnet
   - **RPC URL**: https://rpc-amoy.polygon.technology/
   - **Chain ID**: 80002
   - **货币符号**: MATIC
   - **区块浏览器**: https://amoy.polygonscan.com

4. 确保有测试 MATIC（至少 0.1 MATIC）
   - 如果没有，访问: https://faucet.polygon.technology/

### 2. 连接钱包

1. 访问 http://localhost:5174
2. 点击右上角 "连接钱包"
3. 选择 MetaMask
4. 在 MetaMask 中点击 "连接"
5. 确认连接成功（显示钱包地址和余额）

### 3. 铸造 NFT

1. 点击导航栏的 "铸造 NFT"
2. 填写 NFT 信息：
   - **名称**: 例如 "My First NFT"
   - **描述**: 例如 "This is my first NFT on Polygon Amoy"
   - **分类**: 选择一个分类（艺术、音乐、游戏等）
   - **版税**: 设置 0-10% 之间的版税
   - **图片**: 上传一张图片（JPG/PNG/GIF，最大 10MB）

3. 点击 "铸造 NFT" 按钮

4. 等待 IPFS 上传（会显示进度）

5. 在 MetaMask 中确认交易：
   - 检查 gas 费用
   - 点击 "确认"

6. 等待交易确认（约 5-10 秒）
   - 会显示 "交易已提交" 提示
   - 然后显示 "NFT 铸造成功" 提示

### 4. 验证 NFT

#### 方法 1: 在区块浏览器查看

1. 复制交易哈希（从成功提示中）
2. 访问: https://amoy.polygonscan.com/tx/[交易哈希]
3. 查看交易详情和事件日志

#### 方法 2: 等待索引器同步

1. 等待 15-30 秒（索引器每 15 秒扫描一次）
2. 刷新前端页面
3. 进入 "市场" 或 "我的 NFT" 页面
4. 应该能看到新铸造的 NFT

#### 方法 3: 检查数据库

```bash
cd backend
source /Users/wangxinxin/.envs/nfts/bin/activate
python check_db.py
```

应该能看到：
- NFTs 表有 1 条记录
- Transactions 表有 1 条记录（类型为 'mint'）

### 5. 测试其他功能

#### 挂单出售
1. 进入 "我的 NFT" 页面
2. 点击 NFT 卡片
3. 点击 "挂单出售"
4. 输入价格（例如 0.1 MATIC）
5. 确认交易
6. 等待确认

#### 购买 NFT（需要另一个钱包）
1. 切换到另一个 MetaMask 账户
2. 进入 "市场" 页面
3. 找到挂单的 NFT
4. 点击 "购买"
5. 确认交易
6. 等待确认

#### 取消挂单
1. 进入 "我的 NFT" 页面
2. 点击已挂单的 NFT
3. 点击 "取消挂单"
4. 确认交易
5. 等待确认

#### 销毁 NFT
1. 进入 "我的 NFT" 页面
2. 点击 NFT 卡片
3. 点击 "销毁 NFT"
4. 确认操作
5. 确认交易
6. 等待确认

## 🐛 故障排除

### 钱包连接失败
- 确保 MetaMask 已安装并解锁
- 确保切换到 Polygon Amoy 网络
- 刷新页面重试

### 交易失败
- 检查钱包余额（至少 0.1 MATIC）
- 检查 gas 费用设置
- 查看 MetaMask 错误信息
- 查看浏览器控制台错误

### IPFS 上传失败
- 检查图片大小（最大 10MB）
- 检查图片格式（JPG/PNG/GIF/WEBP）
- 检查网络连接
- 查看浏览器控制台错误

### NFT 不显示
- 等待 15-30 秒（索引器同步）
- 刷新页面
- 检查后端日志
- 运行 `python check_db.py` 检查数据库

### 索引器未同步
- 检查后端日志（应该看到 "✅ Indexed up to block XXX"）
- 确认交易已在区块链上确认
- 等待更长时间（最多 1 分钟）

## 📊 预期结果

铸造成功后，你应该能看到：

1. **MetaMask**: 交易确认，余额减少（gas 费用）
2. **区块浏览器**: 交易记录和事件日志
3. **前端页面**: NFT 显示在市场和个人页面
4. **数据库**: NFT 和交易记录
5. **后端日志**: "✅ Indexed NFT Minted: Token ID X"

## 🎯 成功标志

- ✅ 钱包成功连接
- ✅ 图片成功上传到 IPFS
- ✅ 交易成功提交到区块链
- ✅ 交易在区块浏览器可见
- ✅ 索引器成功索引事件
- ✅ NFT 在前端页面显示
- ✅ 数据库包含 NFT 记录

---

**准备好了吗？开始铸造你的第一个 NFT！** 🚀
