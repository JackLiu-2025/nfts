# 自动跳转功能总结

## 🎯 跳转逻辑

| 操作 | 倒计时 | 跳转目标 | URL | 提示文字 |
|------|--------|----------|-----|----------|
| 铸造 NFT | 无 | 停留 | - | - |
| 挂单出售 | 3秒 | 个人中心-出售中 | `/profile?tab=listed` | "Redirecting to your listings in 3s..." |
| 取消挂单 | 3秒 | 市场页面 | `/marketplace` | "Redirecting to marketplace in 3s..." |
| 购买 NFT | 2秒 | 个人中心-收藏 | `/profile?tab=collected` | "Redirecting to your collection in 2s..." |
| 销毁 NFT | 立即 | 个人中心 | `/profile` | - |

## ✅ 实现细节

### 1. 挂单成功
```tsx
toast.success(
  <div>
    <p>NFT listed successfully!</p>
    <p className="text-sm text-white/70 mt-1">TX: {transactionHash.slice(0, 10)}...</p>
    <p className="text-sm text-cyber-cyan mt-2">Redirecting to your listings in 3s...</p>
  </div>,
  { duration: 3000 }
);

setTimeout(() => {
  navigate('/profile?tab=listed');
}, 3000);
```

### 2. 取消挂单
```tsx
toast.success(
  <div>
    <p>Listing cancelled successfully!</p>
    <p className="text-sm text-white/70 mt-1">TX: {transactionHash.slice(0, 10)}...</p>
    <p className="text-sm text-cyber-cyan mt-2">Redirecting to marketplace in 3s...</p>
  </div>,
  { duration: 3000 }
);

setTimeout(() => {
  navigate('/marketplace');
}, 3000);
```

### 3. 购买成功
```tsx
toast.success(
  <div>
    <p>{t('toast.transactionSuccess')}</p>
    <p className="text-sm text-white/70 mt-1">TX: {transactionHash.slice(0, 10)}...</p>
    <p className="text-sm text-cyber-cyan mt-2">Redirecting to your collection in 2s...</p>
  </div>,
  { duration: 2000 }
);

setTimeout(() => {
  navigate('/profile?tab=collected');
}, 2000);
```

## 🔧 个人中心 URL 参数

ProfilePage 现在支持通过 URL 参数设置初始标签：

```tsx
// 导入
import { useSearchParams } from 'react-router-dom';

// 读取参数
const [searchParams] = useSearchParams();
const initialTab = (searchParams.get('tab') as 'created' | 'collected' | 'listed') || 'created';
const [activeTab, setActiveTab] = useState(initialTab);
```

### 支持的参数值

- `?tab=created` - 我的创作
- `?tab=collected` - 我的收藏
- `?tab=listed` - 我的挂单
- 无参数 - 默认显示"我的创作"

## 🧪 测试场景

### 场景 1: 挂单流程
1. 进入未挂单的 NFT 详情页
2. 点击"挂单出售"
3. 输入价格并确认
4. MetaMask 确认交易
5. **预期结果：**
   - ✅ 显示成功提示
   - ✅ 显示倒计时 "3s..."
   - ✅ 3秒后跳转到个人中心
   - ✅ 自动切换到"出售中"标签
   - ✅ 可以看到刚挂单的 NFT

### 场景 2: 取消挂单流程
1. 进入已挂单的 NFT 详情页
2. 点击"取消挂单"
3. MetaMask 确认交易
4. **预期结果：**
   - ✅ 显示成功提示
   - ✅ 显示倒计时 "3s..."
   - ✅ 3秒后跳转到市场页面

### 场景 3: 购买流程
1. 进入别人挂单的 NFT 详情页
2. 点击"购买"
3. MetaMask 确认交易
4. **预期结果：**
   - ✅ 显示成功提示
   - ✅ 显示倒计时 "2s..."
   - ✅ 2秒后跳转到个人中心
   - ✅ 自动切换到"我的收藏"标签
   - ✅ 购买的 NFT 显示在列表中

### 场景 4: 直接访问个人中心标签
1. 访问 `http://localhost:5174/profile?tab=collected`
2. **预期结果：**
   - ✅ 页面打开时显示"我的收藏"标签

## 📊 用户体验优化

### 为什么不同操作有不同的跳转目标？

1. **挂单 → 个人中心-出售中**
   - 用户想立即查看挂单状态
   - 确认价格和信息是否正确
   - 方便管理所有挂单的 NFT

2. **取消挂单 → 市场页面**
   - NFT 已下架，不再出售
   - 返回市场浏览其他 NFT
   - 符合用户浏览习惯

3. **购买 → 个人中心-收藏**
   - 用户急于查看购买的 NFT
   - 直接跳转到相关内容
   - 更快的反馈提升满意度

### 为什么不同操作有不同的倒计时？

1. **挂单/取消挂单 - 3秒**
   - 用户需要时间看到交易哈希
   - 可能想复制交易哈希
   - 跳转不是紧急操作

2. **购买 - 2秒**
   - 用户急于查看购买的 NFT
   - 更快的反馈提升满意度
   - 直接跳转到相关内容

3. **铸造 - 不跳转**
   - 用户可能想继续铸造
   - 停留在当前页面更方便

4. **销毁 - 立即跳转**
   - NFT 已不存在
   - 停留在详情页无意义
   - 立即返回个人中心

## 🎨 Toast 样式

所有跳转提示都使用统一的样式：

```tsx
<div>
  <p>操作成功消息</p>
  <p className="text-sm text-white/70 mt-1">TX: {hash}...</p>
  <p className="text-sm text-cyber-cyan mt-2">跳转倒计时...</p>
</div>
```

- 第一行：操作结果（白色）
- 第二行：交易哈希（灰色）
- 第三行：跳转提示（青色，突出显示）

## 🔄 与其他功能的配合

### 1. 余额更新
购买成功后会自动更新钱包余额：
```tsx
await updateBalance();
```

### 2. NFT 数据刷新
所有操作成功后都会重新加载 NFT 数据：
```tsx
const updatedNFT = await nftApi.get(nft.tokenId);
setNft(updatedNFT);
```

### 3. Modal 关闭
操作成功后会关闭相关的 Modal：
```tsx
setShowBuyModal(false);
setShowListModal(false);
```

## 💡 未来可能的改进

1. **可配置的倒计时**
   - 允许用户在设置中自定义倒计时时长
   - 或者添加"立即跳转"按钮

2. **取消跳转**
   - 在倒计时期间显示"取消"按钮
   - 允许用户停留在当前页面

3. **跳转动画**
   - 添加页面切换动画
   - 提升视觉体验

4. **历史记录**
   - 记住用户上次访问的标签
   - 下次打开时自动切换

---

**所有自动跳转功能已完成并测试通过！** 🎉
