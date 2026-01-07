# ExplorerLink 功能测试指南

## 新增功能

### 1. 区块链浏览器跳转
- 所有地址和交易哈希现在都可以点击
- 点击后会在新标签页打开区块链浏览器
- 浏览器 URL 可通过环境变量配置：`VITE_EXPLORER_URL`
- 默认：`https://amoy.polygonscan.com`

### 2. 鼠标悬浮显示完整内容
- 鼠标悬浮在地址/哈希上会显示完整值（通过 title 属性）
- 悬浮时会显示外部链接图标

### 3. 取消挂单后自动跳转
- 取消挂单成功后显示倒计时提示
- 3秒后自动跳转到市场页面

## 测试步骤

### 测试 1: 区块链浏览器跳转
1. 打开任意 NFT 详情页
2. 找到 Creator 或 Owner 地址
3. 点击地址链接
4. 验证：
   - ✅ 新标签页打开
   - ✅ URL 格式：`https://amoy.polygonscan.com/address/0x...`
   - ✅ 页面正确显示地址信息

### 测试 2: 交易哈希跳转
1. 在 NFT 详情页查看交易历史
2. 点击交易哈希链接
3. 验证：
   - ✅ 新标签页打开
   - ✅ URL 格式：`https://amoy.polygonscan.com/tx/0x...`
   - ✅ 页面正确显示交易信息

### 测试 3: 鼠标悬浮显示
1. 将鼠标悬浮在任意地址上
2. 验证：
   - ✅ 显示完整地址（浏览器原生 tooltip）
   - ✅ 显示外部链接图标
   - ✅ 链接颜色变化（hover 效果）

### 测试 4: 取消挂单倒计时
1. 进入已挂单的 NFT 详情页
2. 点击"取消挂单"按钮
3. 在 MetaMask 中确认交易
4. 验证：
   - ✅ 显示成功提示
   - ✅ 提示中包含"Redirecting to marketplace in 3s..."
   - ✅ 3秒后自动跳转到市场页面

### 测试 5: 复制功能保留
1. 找到任意地址
2. 点击复制按钮
3. 验证：
   - ✅ 复制按钮仍然存在
   - ✅ 点击后成功复制完整地址
   - ✅ 显示复制成功提示

## 更新的组件

- ✅ `ExplorerLink.tsx` - 新组件
- ✅ `NFTDetailPage.tsx` - 使用 ExplorerLink，添加倒计时跳转
- ✅ `ProfilePage.tsx` - 使用 ExplorerLink
- ✅ `TransactionFeed.tsx` - 使用 ExplorerLink
- ✅ `NFTCard.tsx` - 使用 ExplorerLink
- ✅ `WalletButton.tsx` - 使用 ExplorerLink

## 环境变量配置

在 `frontend/.env` 中添加：
```
VITE_EXPLORER_URL=https://amoy.polygonscan.com
```

切换到主网时修改为：
```
VITE_EXPLORER_URL=https://polygonscan.com
```

## 注意事项

1. ExplorerLink 组件会自动截断显示（前6位+后4位）
2. 完整内容通过 title 属性显示（鼠标悬浮）
3. 复制按钮默认显示，可通过 `showCopy={false}` 隐藏
4. 外部链接图标仅在鼠标悬浮时显示
