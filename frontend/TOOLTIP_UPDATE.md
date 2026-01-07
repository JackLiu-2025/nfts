# Tooltip 和自动跳转功能更新

## ✅ 已完成的改进

### 1. 自定义 Tooltip 组件
创建了新的 `Tooltip.tsx` 组件，替代原生 HTML title 属性：

**特点：**
- ✅ 鼠标悬浮时显示完整地址/交易哈希
- ✅ 美观的深色背景 + 半透明效果
- ✅ 带箭头指示器
- ✅ 淡入动画效果
- ✅ 自动居中定位

**样式：**
- 背景：深灰色半透明 (`bg-gray-900/95`)
- 边框：白色半透明 (`border-white/10`)
- 字体：等宽字体 (`font-mono`)
- 动画：淡入效果 (`animate-fade-in`)

### 2. 挂单成功后自动跳转
更新了 `NFTDetailPage.tsx` 中的 `handleList` 函数：

**功能：**
- ✅ 挂单成功后显示倒计时提示
- ✅ 提示文字："Redirecting to marketplace in 3s..."
- ✅ 3秒后自动跳转到市场页面
- ✅ Toast 持续时间设置为 3000ms

### 3. 取消挂单后自动跳转
更新了 `NFTDetailPage.tsx` 中的 `handleCancelListing` 函数：

**功能：**
- ✅ 取消挂单成功后显示倒计时提示
- ✅ 提示文字："Redirecting to marketplace in 3s..."
- ✅ 3秒后自动跳转到市场页面
- ✅ Toast 持续时间设置为 3000ms

### 4. 购买成功后自动跳转（新增）
更新了 `NFTDetailPage.tsx` 中的 `handleBuy` 函数：

**功能：**
- ✅ 购买成功后显示倒计时提示
- ✅ 提示文字："Redirecting to your collection in 2s..."
- ✅ 2秒后自动跳转到个人中心的"我的收藏"标签
- ✅ Toast 持续时间设置为 2000ms
- ✅ URL: `/profile?tab=collected`

### 5. 个人中心支持 URL 参数（新增）
更新了 `ProfilePage.tsx` 支持通过 URL 参数设置初始标签：

**功能：**
- ✅ 支持 `?tab=created` - 我的创作
- ✅ 支持 `?tab=collected` - 我的收藏
- ✅ 支持 `?tab=listed` - 我的挂单
- ✅ 默认显示"我的创作"标签

## 📝 更新的文件

1. **新建文件：**
   - `frontend/src/components/ui/Tooltip.tsx` - 自定义 Tooltip 组件

2. **修改文件：**
   - `frontend/src/components/ui/ExplorerLink.tsx` - 使用 Tooltip 组件
   - `frontend/src/pages/NFTDetailPage.tsx` - 添加挂单/取消挂单/购买后跳转
   - `frontend/src/pages/ProfilePage.tsx` - 支持 URL 参数设置初始标签
   - `frontend/src/index.css` - 添加淡入动画

## 🎨 Tooltip 使用示例

### 基本用法
```tsx
import Tooltip from './components/ui/Tooltip';

<Tooltip content="完整的地址或哈希">
  <span>截断的显示内容</span>
</Tooltip>
```

### 在 ExplorerLink 中的使用
```tsx
<Tooltip content={value}>
  <a href={url} target="_blank">
    <span>{displayValue}</span>
    <ExternalLink />
  </a>
</Tooltip>
```

## 🧪 测试步骤

### 测试 1: Tooltip 显示
1. 打开任意包含地址的页面（NFT详情、个人中心等）
2. 将鼠标悬浮在地址上
3. 验证：
   - ✅ 显示完整地址
   - ✅ Tooltip 有深色背景
   - ✅ 有淡入动画
   - ✅ 有箭头指示器
   - ✅ 位置正确（在元素上方居中）

### 测试 2: 交易哈希 Tooltip
1. 在 NFT 详情页查看交易历史
2. 将鼠标悬浮在交易哈希上
3. 验证：
   - ✅ 显示完整交易哈希
   - ✅ Tooltip 样式正确

### 测试 3: 挂单后跳转
1. 进入未挂单的 NFT 详情页
2. 点击"挂单出售"按钮
3. 输入价格并确认
4. 在 MetaMask 中确认交易
5. 验证：
   - ✅ 显示成功提示
   - ✅ 提示中包含"Redirecting to marketplace in 3s..."
   - ✅ 3秒后自动跳转到市场页面

### 测试 4: 购买后跳转（新增）
1. 进入已挂单的 NFT 详情页（不是自己的）
2. 点击"购买"按钮
3. 在 MetaMask 中确认交易
4. 验证：
   - ✅ 显示成功提示
   - ✅ 提示中包含"Redirecting to your collection in 2s..."
   - ✅ 2秒后自动跳转到个人中心
   - ✅ 自动切换到"我的收藏"标签
   - ✅ 购买的 NFT 显示在收藏列表中

### 测试 5: 个人中心 URL 参数
1. 直接访问 `http://localhost:5174/profile?tab=collected`
2. 验证：
   - ✅ 页面打开时自动显示"我的收藏"标签
   
3. 访问 `http://localhost:5174/profile?tab=listed`
4. 验证：
   - ✅ 页面打开时自动显示"我的挂单"标签

### 测试 6: 取消挂单后跳转（已有功能）
1. 进入已挂单的 NFT 详情页
2. 点击"取消挂单"按钮
3. 在 MetaMask 中确认交易
4. 验证：
   - ✅ 显示成功提示
   - ✅ 提示中包含"Redirecting to marketplace in 3s..."
   - ✅ 3秒后自动跳转到市场页面

## 🎯 Tooltip 显示位置

所有使用 `ExplorerLink` 组件的地方都会自动显示 Tooltip：

- ✅ NFT 详情页 - Creator 地址
- ✅ NFT 详情页 - Owner 地址
- ✅ NFT 详情页 - 交易历史中的地址和哈希
- ✅ 个人中心 - 用户地址
- ✅ NFT 卡片 - Creator 地址
- ✅ 钱包按钮 - 连接的钱包地址
- ✅ 交易动态 - 买家/卖家地址和交易哈希

## 🔧 自定义 Tooltip

如果需要在其他地方使用 Tooltip：

```tsx
import Tooltip from './components/ui/Tooltip';

// 基本使用
<Tooltip content="这是完整内容">
  <span>截断内容</span>
</Tooltip>

// 自定义样式
<Tooltip content="完整内容" className="ml-2">
  <button>按钮</button>
</Tooltip>
```

## 💡 技术细节

### 个人中心 URL 参数实现
```tsx
import { useSearchParams } from 'react-router-dom';

const [searchParams] = useSearchParams();
const initialTab = (searchParams.get('tab') as 'created' | 'collected' | 'listed') || 'created';
const [activeTab, setActiveTab] = useState(initialTab);
```

### 购买后跳转实现
```tsx
toast.success(
  <div>
    <p>{t('toast.transactionSuccess')}</p>
    <p className="text-sm text-cyber-cyan mt-2">
      Redirecting to your collection in 2s...
    </p>
  </div>,
  { duration: 2000 }
);

setTimeout(() => {
  navigate('/profile?tab=collected');
}, 2000);
```

### Tooltip 组件实现
- 使用 React state 控制显示/隐藏
- `onMouseEnter` / `onMouseLeave` 事件监听
- 绝对定位 + transform 居中
- `pointer-events-none` 防止 Tooltip 干扰鼠标事件
- `z-50` 确保在最上层显示

### 动画实现
```css
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.2s ease-out;
}
```

### 跳转实现
```tsx
// 挂单成功 - 3秒后跳转到个人中心-出售中
setTimeout(() => {
  navigate('/profile?tab=listed');
}, 3000);

// 取消挂单 - 3秒后跳转到市场
setTimeout(() => {
  navigate('/marketplace');
}, 3000);

// 购买成功 - 2秒后跳转到个人中心-收藏
setTimeout(() => {
  navigate('/profile?tab=collected');
}, 2000);
```

## 🎯 跳转逻辑总结

| 操作 | 倒计时 | 跳转目标 | 原因 |
|------|--------|----------|------|
| 铸造 NFT | 无 | 停留在当前页 | 用户可能想继续铸造 |
| 挂单出售 | 3秒 | 个人中心-出售中 | 查看挂单状态和管理 |
| 取消挂单 | 3秒 | 市场页面 | 返回浏览市场 |
| 购买 NFT | 2秒 | 个人中心-收藏 | 查看购买的 NFT |
| 销毁 NFT | 立即 | 个人中心 | NFT已不存在 |

## 🐛 已知问题

无

## 📚 相关文档

- [ExplorerLink 功能](./TEST_EXPLORER_LINK.md)
- [React Tooltip 最佳实践](https://react.dev/learn/responding-to-events)

---

**更新完成！现在鼠标悬浮会显示完整地址，挂单成功后会自动跳转到市场。** 🎉
