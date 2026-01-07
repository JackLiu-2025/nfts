# Design Document: NFT Marketplace

## Overview

本文档描述了基于Polygon区块链的NFT交易平台的技术设计。该平台采用前后端分离架构，前端使用React构建现代化Web3风格界面，后端使用FastAPI提供RESTful API服务，智能合约使用Solidity实现ERC-721标准。平台支持NFT的铸造、交易、销毁等核心功能，并提供多语言支持。

### 技术栈

**前端：**
- React 18+ (UI框架)
- ethers.js (Web3交互)
- React Router (路由管理)
- TailwindCSS (样式框架)
- Framer Motion (动画效果)
- i18next (国际化)
- Zustand (状态管理)

**后端：**
- FastAPI (Web框架)
- web3.py (区块链交互)
- SQLAlchemy (ORM)
- PostgreSQL (数据库)
- Flyway (数据库迁移)
- Pydantic (数据验证)
- python-multipart (文件上传)
- requests (HTTP客户端)

**智能合约：**
- Solidity 0.8.x
- OpenZeppelin Contracts (ERC-721标准实现)
- Hardhat (开发框架)

**基础设施：**
- Polygon Amoy Testnet (测试环境)
- Polygon Mainnet (生产环境)
- Pinata (IPFS托管)
- IPFS (去中心化存储)

## Architecture

### 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                         用户浏览器                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   React UI   │  │  ethers.js   │  │   MetaMask   │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          │ HTTP/REST        │                  │ JSON-RPC
          │                  │                  │
┌─────────▼──────────────────┼──────────────────▼─────────────┐
│                      后端服务层                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              FastAPI Application                      │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐    │   │
│  │  │ API Routes │  │ Validators │  │  Services  │    │   │
│  │  └────────────┘  └────────────┘  └────────────┘    │   │
│  └──────────┬───────────────────────────┬───────────────┘   │
│             │                           │                    │
│  ┌──────────▼───────────┐   ┌──────────▼──────────┐        │
│  │   PostgreSQL DB      │   │     web3.py         │        │
│  │  (NFT Metadata)      │   │  (Blockchain API)   │        │
│  └──────────────────────┘   └──────────┬──────────┘        │
└─────────────────────────────────────────┼───────────────────┘
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    │                     │                     │
          ┌─────────▼──────────┐  ┌──────▼──────────┐  ┌──────▼──────┐
          │  Polygon Network   │  │  Pinata/IPFS    │  │  Smart      │
          │  (Amoy/Mainnet)    │  │  (File Storage) │  │  Contract   │
          └────────────────────┘  └─────────────────┘  └─────────────┘
```

### 数据流

**NFT铸造流程：**
1. 用户上传图片 → 前端验证
2. 前端发送文件到后端 → 后端验证（类型、大小、MIME）
3. 后端上传到Pinata → 获取IPFS哈希
4. 前端调用智能合约mint函数 → 用户签名交易
5. 交易确认后 → 后端存储NFT元数据到数据库

**NFT交易流程：**
1. 卖家挂单 → 前端调用智能合约createListing
2. 买家购买 → 前端调用智能合约buyNFT
3. 交易确认 → 后端更新数据库所有权和交易历史

## Components and Interfaces

### 前端组件架构

#### UI设计风格

**Web3高端设计理念：**
- 深色主题为主（深空蓝/黑色背景）
- 霓虹渐变色彩（紫色、青色、粉色）
- 玻璃态效果（Glassmorphism）
- 流畅的动画过渡
- 3D悬浮卡片效果
- 粒子背景动画
- 赛博朋克风格元素

**色彩方案：**
```
主色调：
- 背景：#0a0e27 (深空蓝)
- 卡片：rgba(255, 255, 255, 0.05) (玻璃态)
- 主要渐变：linear-gradient(135deg, #667eea 0%, #764ba2 100%)
- 次要渐变：linear-gradient(135deg, #f093fb 0%, #f5576c 100%)
- 强调色：#00f5ff (霓虹青)
- 成功：#00ff88
- 警告：#ffaa00
- 错误：#ff3366
```

#### 核心组件

**1. Layout Components**

```typescript
// AppLayout.tsx - 主布局
interface AppLayoutProps {
  children: React.ReactNode;
}

// Header.tsx - 顶部导航栏
interface HeaderProps {
  walletAddress?: string;
  onConnectWallet: () => void;
  onDisconnectWallet: () => void;
}

// Footer.tsx - 页脚
interface FooterProps {
  // 显示版权信息和社交链接
}

// Sidebar.tsx - 侧边栏（可选）
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}
```

**2. Wallet Components**

```typescript
// WalletButton.tsx - 钱包连接按钮
interface WalletButtonProps {
  address?: string;
  onConnect: () => void;
  onDisconnect: () => void;
}

// WalletModal.tsx - 钱包选择弹窗
interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWallet: (walletType: 'metamask' | 'walletconnect') => void;
}
```

**3. NFT Components**

```typescript
// NFTCard.tsx - NFT卡片
interface NFTCardProps {
  nft: {
    id: string;
    name: string;
    image: string;
    price?: number;
    creator: string;
    owner: string;
  };
  onClick: () => void;
  showActions?: boolean;
}

// NFTGrid.tsx - NFT网格列表
interface NFTGridProps {
  nfts: NFT[];
  loading: boolean;
  onLoadMore: () => void;
}

// NFTDetail.tsx - NFT详情展示
interface NFTDetailProps {
  nft: NFTDetail;
  onBuy: () => void;
  onList: (price: number) => void;
  onBurn: () => void;
}
```

**4. Form Components**

```typescript
// MintForm.tsx - 铸造表单
interface MintFormProps {
  onSubmit: (data: MintFormData) => void;
  loading: boolean;
}

interface MintFormData {
  name: string;
  description: string;
  image: File;
  category: string;
  royalty: number;
}

// ListingForm.tsx - 挂单表单
interface ListingFormProps {
  nftId: string;
  onSubmit: (price: number) => void;
}

// SearchBar.tsx - 搜索栏
interface SearchBarProps {
  onSearch: (query: string) => void;
  onFilter: (filters: FilterOptions) => void;
}
```

**5. Transaction Components**

```typescript
// TransactionFeed.tsx - 交易动态
interface TransactionFeedProps {
  transactions: Transaction[];
  autoRefresh?: boolean;
}

interface Transaction {
  id: string;
  buyer: string;
  nftName: string;
  price: number;
  timestamp: number;
}

// TransactionModal.tsx - 交易确认弹窗
interface TransactionModalProps {
  isOpen: boolean;
  type: 'mint' | 'buy' | 'list' | 'burn';
  data: any;
  onConfirm: () => void;
  onCancel: () => void;
}
```

**6. UI Components**

```typescript
// Button.tsx - 按钮组件
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

// Modal.tsx - 模态框
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

// Toast.tsx - 提示消息
interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

// Loading.tsx - 加载动画
interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

// LanguageSwitcher.tsx - 语言切换器
interface LanguageSwitcherProps {
  currentLanguage: 'zh' | 'ja' | 'en';
  onChangeLanguage: (lang: string) => void;
}
```

### 页面结构

**1. HomePage (首页)**
- Hero区域（大标题 + CTA按钮）
- 实时交易动态（TransactionFeed）
- 热门NFT展示
- 特色分类

**2. MarketplacePage (市场页)**
- 搜索栏和筛选器
- NFT网格列表
- 分页加载

**3. MintPage (铸造页)**
- 文件上传区域
- 铸造表单
- 预览区域

**4. ProfilePage (个人中心)**
- 用户信息展示
- 三个标签页：
  - 我创作的
  - 我收藏的
  - 出售中
- NFT网格列表

**5. NFTDetailPage (NFT详情页)**
- NFT大图展示
- 元数据信息
- 所有者/创作者信息
- 交易历史
- 操作按钮（购买/挂单/销毁）

### 后端API接口

#### RESTful API设计

**Base URL:** `http://localhost:8000/api/v1`

**认证方式：** 
- 使用钱包签名验证
- 请求头携带：`X-Wallet-Address` 和 `X-Signature`

#### API端点

**1. 认证相关**

```python
POST /auth/nonce
# 获取签名随机数
Request: { "wallet_address": "0x..." }
Response: { "nonce": "random_string" }

POST /auth/verify
# 验证签名
Request: { 
  "wallet_address": "0x...",
  "signature": "0x...",
  "nonce": "random_string"
}
Response: { 
  "token": "jwt_token",
  "wallet_address": "0x..."
}
```

**2. NFT相关**

```python
POST /nfts/upload
# 上传图片到IPFS
Request: multipart/form-data { file: File }
Response: { 
  "ipfs_hash": "Qm...",
  "ipfs_url": "https://gateway.pinata.cloud/ipfs/Qm..."
}

POST /nfts
# 创建NFT记录（铸造后调用）
Request: {
  "token_id": "1",
  "name": "NFT Name",
  "description": "Description",
  "image_url": "ipfs://Qm...",
  "creator": "0x...",
  "owner": "0x...",
  "category": "art",
  "royalty": 5.0
}
Response: { "id": "uuid", "token_id": "1", ... }

GET /nfts
# 获取NFT列表
Query: ?page=1&limit=50&category=art&min_price=0&max_price=1000&search=keyword
Response: {
  "items": [NFT],
  "total": 100,
  "page": 1,
  "pages": 2
}

GET /nfts/{nft_id}
# 获取NFT详情
Response: { NFT详细信息 + 交易历史 }

GET /nfts/token/{token_id}
# 通过token_id获取NFT
Response: { NFT详细信息 }
```

**3. 交易相关**

```python
POST /listings
# 创建挂单记录
Request: {
  "nft_id": "uuid",
  "token_id": "1",
  "seller": "0x...",
  "price": 10.5
}
Response: { "listing_id": "uuid", ... }

DELETE /listings/{listing_id}
# 取消挂单
Response: { "success": true }

PUT /listings/{listing_id}
# 修改价格
Request: { "price": 15.0 }
Response: { "listing_id": "uuid", "price": 15.0 }

GET /listings
# 获取所有挂单
Query: ?page=1&limit=50
Response: { "items": [Listing], "total": 100 }

POST /transactions
# 记录交易
Request: {
  "nft_id": "uuid",
  "token_id": "1",
  "from_address": "0x...",
  "to_address": "0x...",
  "price": 10.5,
  "tx_hash": "0x..."
}
Response: { "transaction_id": "uuid", ... }

GET /transactions/recent
# 获取最近交易
Query: ?limit=20
Response: { "items": [Transaction] }

GET /transactions/nft/{nft_id}
# 获取NFT交易历史
Response: { "items": [Transaction] }
```

**4. 用户相关**

```python
GET /users/{wallet_address}/nfts
# 获取用户的NFT
Query: ?type=created|collected|listed
Response: { "items": [NFT] }

GET /users/{wallet_address}/stats
# 获取用户统计
Response: {
  "created_count": 10,
  "collected_count": 5,
  "listed_count": 3,
  "total_sales": 100.5
}
```

**5. 系统相关**

```python
GET /health
# 健康检查
Response: { "status": "ok", "timestamp": 1234567890 }

GET /stats
# 平台统计
Response: {
  "total_nfts": 1000,
  "total_users": 500,
  "total_volume": 10000.5,
  "total_transactions": 2000
}
```

### 智能合约接口

#### NFTMarketplace.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract NFTMarketplace is ERC721URIStorage, ERC721Royalty, Ownable, ReentrancyGuard {
    
    // 核心函数
    
    function mint(
        address to,
        string memory tokenURI,
        uint96 royaltyFee
    ) external returns (uint256);
    
    function burn(uint256 tokenId) external;
    
    function createListing(
        uint256 tokenId,
        uint256 price
    ) external;
    
    function cancelListing(uint256 tokenId) external;
    
    function buyNFT(uint256 tokenId) external payable nonReentrant;
    
    function updateListingPrice(
        uint256 tokenId,
        uint256 newPrice
    ) external;
    
    // 查询函数
    
    function getListing(uint256 tokenId) external view returns (Listing memory);
    
    function getListedNFTs() external view returns (uint256[] memory);
    
    function getUserNFTs(address user) external view returns (uint256[] memory);
    
    // 事件
    
    event NFTMinted(uint256 indexed tokenId, address indexed creator, string tokenURI);
    event NFTBurned(uint256 indexed tokenId, address indexed owner);
    event NFTListed(uint256 indexed tokenId, address indexed seller, uint256 price);
    event ListingCancelled(uint256 indexed tokenId, address indexed seller);
    event NFTSold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price);
    event ListingPriceUpdated(uint256 indexed tokenId, uint256 oldPrice, uint256 newPrice);
}
```

## Data Models

### 数据库Schema设计

#### 表结构

**1. users表**
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    nonce VARCHAR(64),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_wallet_address (wallet_address)
);
```

**2. nfts表**
```sql
CREATE TABLE nfts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_id BIGINT UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    ipfs_hash VARCHAR(100),
    creator_address VARCHAR(42) NOT NULL,
    current_owner_address VARCHAR(42) NOT NULL,
    category VARCHAR(50),
    royalty_percentage DECIMAL(5,2) DEFAULT 0,
    is_burned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_token_id (token_id),
    INDEX idx_creator (creator_address),
    INDEX idx_owner (current_owner_address),
    INDEX idx_category (category),
    FOREIGN KEY (creator_address) REFERENCES users(wallet_address),
    FOREIGN KEY (current_owner_address) REFERENCES users(wallet_address)
);
```

**3. listings表**
```sql
CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nft_id UUID NOT NULL,
    token_id BIGINT NOT NULL,
    seller_address VARCHAR(42) NOT NULL,
    price DECIMAL(20,8) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cancelled_at TIMESTAMP,
    INDEX idx_nft_id (nft_id),
    INDEX idx_seller (seller_address),
    INDEX idx_active (is_active),
    FOREIGN KEY (nft_id) REFERENCES nfts(id),
    FOREIGN KEY (seller_address) REFERENCES users(wallet_address)
);
```

**4. transactions表**
```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nft_id UUID NOT NULL,
    token_id BIGINT NOT NULL,
    from_address VARCHAR(42) NOT NULL,
    to_address VARCHAR(42) NOT NULL,
    price DECIMAL(20,8),
    transaction_hash VARCHAR(66) NOT NULL,
    transaction_type VARCHAR(20) NOT NULL, -- 'mint', 'sale', 'transfer', 'burn'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_nft_id (nft_id),
    INDEX idx_from (from_address),
    INDEX idx_to (to_address),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (nft_id) REFERENCES nfts(id)
);
```

**5. rate_limits表**
```sql
CREATE TABLE rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier VARCHAR(100) NOT NULL, -- IP地址或钱包地址
    action_type VARCHAR(50) NOT NULL, -- 'mint', 'search', 'api_request'
    request_count INT DEFAULT 1,
    window_start TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_identifier_action (identifier, action_type),
    INDEX idx_window_start (window_start)
);
```

### Pydantic模型

```python
from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from decimal import Decimal

class NFTBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=1000)
    category: str
    royalty_percentage: Decimal = Field(..., ge=0, le=10)

class NFTCreate(NFTBase):
    token_id: int
    image_url: str
    ipfs_hash: str
    creator_address: str
    current_owner_address: str

class NFT(NFTBase):
    id: str
    token_id: int
    image_url: str
    ipfs_hash: str
    creator_address: str
    current_owner_address: str
    is_burned: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ListingCreate(BaseModel):
    nft_id: str
    token_id: int
    seller_address: str
    price: Decimal = Field(..., gt=0.001, le=1000000)

class Listing(ListingCreate):
    id: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TransactionCreate(BaseModel):
    nft_id: str
    token_id: int
    from_address: str
    to_address: str
    price: Optional[Decimal]
    transaction_hash: str
    transaction_type: str

class Transaction(TransactionCreate):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True
```

## Correctness Properties

*属性（Property）是关于系统行为的形式化陈述，应该在所有有效执行中保持为真。属性是人类可读规范和机器可验证正确性保证之间的桥梁。通过属性测试，我们可以验证系统在各种输入下的正确性。*

### Property 1: 文件上传综合验证
*For any* 上传的文件，系统应该验证：(1) 文件扩展名在白名单内（jpg, jpeg, png, gif, webp），(2) 文件大小不超过10MB，(3) MIME类型与扩展名一致，(4) 文件头魔数与声明类型匹配。只有所有验证都通过的文件才应该被接受。
**Validates: Requirements 2.1, 2.2, 2.3, 10.1, 10.2, 10.3**

### Property 2: 文件验证失败拒绝
*For any* 不符合验证规则的文件，系统应该拒绝上传并返回具体的错误原因（如"文件类型不支持"、"文件过大"等）。
**Validates: Requirements 2.4**

### Property 3: IPFS上传返回哈希
*For any* 验证通过的文件，成功上传到IPFS后应该返回有效的IPFS哈希值（以"Qm"开头的字符串）。
**Validates: Requirements 2.5, 2.6**

### Property 4: NFT元数据验证
*For any* NFT元数据输入，系统应该验证：(1) 名称长度在1-100字符之间，(2) 描述长度不超过1000字符，(3) 版税比例在0-10%之间。
**Validates: Requirements 2.7, 2.8, 2.9**

### Property 5: 价格范围验证
*For any* 价格输入（挂单或修改价格），系统应该验证价格大于0.001 MATIC且不超过1000000 MATIC。
**Validates: Requirements 4.2, 4.3, 5.10**

### Property 6: 钱包地址脱敏显示
*For any* 钱包地址显示，系统应该使用脱敏格式：保留前6位和后4位，中间用"..."替代（如"0x1234...5678"）。
**Validates: Requirements 1.4, 7.3, 7.4**

### Property 7: 钱包签名验证
*For any* 钱包授权请求，当签名验证成功时，系统应该获取钱包地址并建立会话；当签名验证失败时，系统应该拒绝连接并显示错误消息。
**Validates: Requirements 1.3, 1.6, 10.8**

### Property 8: 会话状态管理
*For any* 钱包连接状态，当用户断开连接时，系统应该清除所有会话状态（包括localStorage和内存中的状态），并将UI恢复到未连接状态。
**Validates: Requirements 1.5**

### Property 9: NFT所有权验证
*For any* 需要所有权的操作（销毁、挂单、取消挂单），系统应该验证当前用户是NFT的持有者。非持有者的请求应该被拒绝并返回错误消息。
**Validates: Requirements 3.1, 3.2, 4.1, 4.6**

### Property 10: 铸造后数据持久化
*For any* 成功的铸造交易，系统应该在数据库中创建NFT记录，包含所有元数据（token_id, name, description, image_url, creator, owner等）。
**Validates: Requirements 2.11**

### Property 11: 销毁后状态更新
*For any* 成功的销毁交易，系统应该：(1) 更新数据库中NFT的is_burned状态为true，(2) 从用户持有列表中移除该NFT。
**Validates: Requirements 3.7, 3.8**

### Property 12: 挂单数据一致性
*For any* 成功的挂单操作，系统应该：(1) 调用智能合约创建链上挂单，(2) 在数据库中创建对应的挂单记录，(3) 两者的token_id、seller和price应该一致。
**Validates: Requirements 4.4, 4.5**

### Property 13: 取消挂单数据同步
*For any* 成功的取消挂单操作，系统应该：(1) 调用智能合约取消链上挂单，(2) 更新数据库中挂单的is_active状态为false。
**Validates: Requirements 4.7**

### Property 14: 购买前状态验证
*For any* 购买请求，系统应该验证：(1) NFT当前处于出售状态（is_active=true），(2) 买家钱包余额足够支付价格和gas费。不满足条件的请求应该被拒绝。
**Validates: Requirements 4.8, 4.9**

### Property 15: 交易后数据更新
*For any* 成功的购买交易，系统应该：(1) 更新NFT的current_owner为买家地址，(2) 将挂单状态设为inactive，(3) 创建交易历史记录。
**Validates: Requirements 4.11, 4.12**

### Property 16: 并发购买防护
*For any* NFT，如果已被购买（挂单已inactive），后续的购买请求应该被拒绝并显示"NFT已售出"错误。
**Validates: Requirements 4.13**

### Property 17: 个人中心数据分类
*For any* 用户，"我创作的"标签应该只显示creator_address等于该用户的NFT；"我收藏的"标签应该只显示current_owner等于该用户且creator不是该用户的NFT；"出售中"标签应该只显示seller_address等于该用户且is_active=true的NFT。
**Validates: Requirements 5.2, 5.3, 5.6, 5.8**

### Property 18: 市场列表筛选
*For any* 市场查询，返回的NFT应该：(1) 都处于出售状态，(2) 如果有分类筛选，都属于选定分类，(3) 如果有价格范围筛选，价格都在范围内。
**Validates: Requirements 6.1, 6.6, 6.7**

### Property 19: 分页限制
*For any* 列表查询，每页返回的记录数应该不超过50条。
**Validates: Requirements 6.2**

### Property 20: 搜索结果匹配
*For any* 搜索查询，返回的NFT应该在名称、描述或创作者地址中包含搜索关键词，且结果总数不超过1000条。
**Validates: Requirements 6.3, 6.4**

### Property 21: 速率限制保护
*For any* 用户或IP，当在时间窗口内的请求次数超过限制时（铸造：5次/小时，搜索：20次/分钟，API：100次/分钟），系统应该拒绝请求并返回速率限制错误。
**Validates: Requirements 2.13, 6.5, 10.4**

### Property 22: 交易历史完整性
*For any* NFT的交易历史记录，每条记录应该包含：transaction_type, from_address, to_address, price（如果是sale类型）, transaction_hash, timestamp。
**Validates: Requirements 7.7, 7.8**

### Property 23: 实时交易动态展示
*For any* 新发生的交易，应该在30秒内出现在Transaction_Feed中，且每条记录包含：买家地址（脱敏）、NFT名称、相对时间（如"2分钟前"）。
**Validates: Requirements 8.2, 8.3, 8.4, 8.5**

### Property 24: 多语言切换一致性
*For any* 语言切换操作，系统应该：(1) 立即更新所有UI文本为目标语言，(2) 将语言偏好保存到localStorage，(3) 后续错误消息也使用该语言。
**Validates: Requirements 9.3, 9.4, 9.6**

### Property 25: 语言偏好持久化
*For any* 用户，首次访问时应该根据浏览器语言设置默认语言；再次访问时应该使用localStorage中保存的语言偏好。
**Validates: Requirements 9.2, 9.5**

### Property 26: XSS防护
*For any* 用户输入（NFT名称、描述等），系统应该清理和转义HTML特殊字符（<, >, &, ", '），防止XSS攻击。
**Validates: Requirements 10.5**

### Property 27: 智能合约参数验证
*For any* 智能合约调用，系统应该在调用前验证参数的有效性（如token_id存在、price为正数等）。无效参数应该被拒绝而不是发送到链上。
**Validates: Requirements 10.7**

### Property 28: 错误消息安全性
*For any* 系统错误，返回给前端的错误消息应该是友好的通用消息（如"操作失败，请稍后重试"），不应该包含敏感信息（如数据库错误堆栈、内部路径等）。
**Validates: Requirements 10.9**

### Property 29: IPFS上传重试机制
*For any* IPFS上传失败，系统应该自动重试最多3次。如果3次都失败，才返回错误给用户。
**Validates: Requirements 10.10**

### Property 30: 智能合约错误处理
*For any* 智能合约交易失败，系统应该捕获错误并返回友好的错误消息（如"交易失败：余额不足"），而不是原始的合约错误。
**Validates: Requirements 12.5**

## Error Handling

### 前端错误处理

**网络错误：**
- 使用axios interceptor统一处理
- 超时设置：30秒
- 自动重试：GET请求重试2次
- 错误提示：Toast消息

**钱包错误：**
- 用户拒绝连接：提示"请授权连接钱包"
- 网络不匹配：提示"请切换到Polygon网络"
- 余额不足：提示"余额不足，请充值"
- 交易失败：显示具体原因

**表单验证错误：**
- 实时验证：输入时显示错误
- 提交前验证：阻止无效提交
- 错误高亮：红色边框 + 错误文本

### 后端错误处理

**HTTP状态码：**
```python
200 OK - 成功
201 Created - 创建成功
400 Bad Request - 参数错误
401 Unauthorized - 未授权
403 Forbidden - 权限不足
404 Not Found - 资源不存在
429 Too Many Requests - 速率限制
500 Internal Server Error - 服务器错误
503 Service Unavailable - 服务不可用
```

**错误响应格式：**
```json
{
  "error": {
    "code": "INVALID_FILE_TYPE",
    "message": "文件类型不支持，请上传jpg、png、gif或webp格式",
    "details": {
      "allowed_types": ["jpg", "jpeg", "png", "gif", "webp"],
      "received_type": "pdf"
    }
  }
}
```

**异常处理策略：**
- 使用FastAPI的HTTPException
- 全局异常处理器捕获未处理异常
- 记录详细日志到文件
- 返回友好错误消息给前端

### 智能合约错误处理

**常见错误：**
- `ERC721: token already minted` - Token ID已存在
- `ERC721: transfer caller is not owner` - 非所有者操作
- `Insufficient balance` - 余额不足
- `Listing not found` - 挂单不存在
- `NFT not for sale` - NFT未出售

**错误映射：**
```python
CONTRACT_ERROR_MESSAGES = {
    "token already minted": "该NFT已存在",
    "caller is not owner": "您不是该NFT的所有者",
    "insufficient balance": "余额不足",
    "listing not found": "挂单不存在",
    "not for sale": "该NFT未出售"
}
```

## Testing Strategy

### 测试方法

本项目采用**双重测试策略**：单元测试和属性测试相结合，确保全面的代码覆盖和正确性验证。

**单元测试：**
- 验证特定示例和边界情况
- 测试集成点和组件交互
- 测试错误条件和异常处理
- 使用具体的输入输出验证功能

**属性测试：**
- 验证通用属性在所有输入下成立
- 通过随机生成大量测试用例
- 发现边界情况和意外行为
- 提供更高的正确性保证

两种测试方法互补：单元测试捕获具体的bug，属性测试验证通用的正确性。

### 前端测试

**测试框架：**
- Jest (测试运行器)
- React Testing Library (组件测试)
- fast-check (属性测试库)
- MSW (Mock Service Worker - API模拟)

**测试类型：**

1. **组件单元测试**
```typescript
// 示例：WalletButton组件测试
describe('WalletButton', () => {
  it('should display connect button when not connected', () => {
    render(<WalletButton onConnect={jest.fn()} />);
    expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
  });
  
  it('should display address when connected', () => {
    render(<WalletButton address="0x1234567890abcdef" onDisconnect={jest.fn()} />);
    expect(screen.getByText('0x1234...cdef')).toBeInTheDocument();
  });
});
```

2. **属性测试**
```typescript
// 示例：地址脱敏属性测试
import fc from 'fast-check';

describe('Property: Wallet address masking', () => {
  it('should mask any valid address correctly', () => {
    // Feature: nft-marketplace, Property 6: 钱包地址脱敏显示
    fc.assert(
      fc.property(
        fc.hexaString({ minLength: 40, maxLength: 40 }),
        (address) => {
          const fullAddress = '0x' + address;
          const masked = maskAddress(fullAddress);
          expect(masked).toMatch(/^0x[0-9a-f]{4}\.\.\.[0-9a-f]{4}$/i);
          expect(masked.startsWith(fullAddress.slice(0, 6))).toBe(true);
          expect(masked.endsWith(fullAddress.slice(-4))).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

3. **集成测试**
- 测试完整的用户流程（铸造 → 挂单 → 购买）
- 使用测试网络进行端到端测试

### 后端测试

**测试框架：**
- pytest (测试运行器)
- pytest-asyncio (异步测试)
- Hypothesis (属性测试库)
- httpx (HTTP客户端测试)

**测试类型：**

1. **API单元测试**
```python
# 示例：文件上传API测试
def test_upload_valid_image(client, test_image):
    response = client.post(
        "/api/v1/nfts/upload",
        files={"file": ("test.jpg", test_image, "image/jpeg")}
    )
    assert response.status_code == 200
    assert "ipfs_hash" in response.json()

def test_upload_oversized_file(client, large_image):
    response = client.post(
        "/api/v1/nfts/upload",
        files={"file": ("large.jpg", large_image, "image/jpeg")}
    )
    assert response.status_code == 400
    assert "文件过大" in response.json()["error"]["message"]
```

2. **属性测试**
```python
# 示例：价格验证属性测试
from hypothesis import given, strategies as st

@given(st.decimals(min_value=0.001, max_value=1000000))
def test_property_valid_price_accepted(price):
    """
    Feature: nft-marketplace, Property 5: 价格范围验证
    For any price between 0.001 and 1000000, validation should pass
    """
    result = validate_price(price)
    assert result.is_valid == True

@given(st.one_of(
    st.decimals(max_value=0.0009),
    st.decimals(min_value=1000001)
))
def test_property_invalid_price_rejected(price):
    """
    Feature: nft-marketplace, Property 5: 价格范围验证
    For any price outside the range, validation should fail
    """
    result = validate_price(price)
    assert result.is_valid == False
```

3. **数据库测试**
- 使用测试数据库
- 每个测试后回滚事务
- 测试数据完整性约束

### 智能合约测试

**测试框架：**
- Hardhat (开发环境)
- Chai (断言库)
- Waffle (合约测试)
- fast-check (属性测试)

**测试类型：**

1. **功能测试**
```javascript
describe("NFTMarketplace", function () {
  it("Should mint NFT with correct metadata", async function () {
    const [owner] = await ethers.getSigners();
    const tokenURI = "ipfs://QmTest";
    const royalty = 500; // 5%
    
    await marketplace.mint(owner.address, tokenURI, royalty);
    
    expect(await marketplace.ownerOf(1)).to.equal(owner.address);
    expect(await marketplace.tokenURI(1)).to.equal(tokenURI);
  });
  
  it("Should prevent non-owner from burning NFT", async function () {
    const [owner, other] = await ethers.getSigners();
    await marketplace.mint(owner.address, "ipfs://QmTest", 0);
    
    await expect(
      marketplace.connect(other).burn(1)
    ).to.be.revertedWith("ERC721: caller is not owner");
  });
});
```

2. **安全测试**
- 重入攻击测试
- 权限控制测试
- 溢出测试

### 测试配置

**属性测试配置：**
- 最小迭代次数：100次
- 每个属性测试必须引用设计文档中的属性编号
- 标签格式：`Feature: nft-marketplace, Property {number}: {property_text}`

**测试覆盖率目标：**
- 前端：80%以上
- 后端：90%以上
- 智能合约：100%

**CI/CD集成：**
- 每次提交自动运行测试
- Pull Request必须通过所有测试
- 测试失败阻止合并

## Implementation Notes

### 项目结构

```
nft-marketplace/
├── frontend/                 # React前端
│   ├── src/
│   │   ├── components/      # React组件
│   │   ├── pages/           # 页面组件
│   │   ├── hooks/           # 自定义Hooks
│   │   ├── services/        # API服务
│   │   ├── utils/           # 工具函数
│   │   ├── store/           # 状态管理
│   │   ├── i18n/            # 国际化
│   │   ├── contracts/       # 合约ABI
│   │   └── App.tsx
│   ├── public/
│   ├── package.json
│   └── tailwind.config.js
│
├── backend/                  # FastAPI后端
│   ├── app/
│   │   ├── api/             # API路由
│   │   ├── models/          # 数据模型
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── services/        # 业务逻辑
│   │   ├── utils/           # 工具函数
│   │   ├── middleware/      # 中间件
│   │   └── main.py
│   ├── tests/               # 测试
│   ├── migrations/          # Flyway迁移脚本
│   ├── requirements.txt
│   └── .env.example
│
├── contracts/                # Solidity智能合约
│   ├── contracts/
│   │   └── NFTMarketplace.sol
│   ├── scripts/             # 部署脚本
│   ├── test/                # 合约测试
│   ├── hardhat.config.js
│   └── package.json
│
├── docs/                     # 文档
│   ├── api.md               # API文档
│   ├── deployment.md        # 部署指南
│   └── user-guide.md        # 用户指南
│
└── .kiro/specs/nft-marketplace/
    ├── requirements.md
    ├── design.md
    └── tasks.md
```

### 开发环境设置

**前端：**
```bash
cd frontend
npm install
npm run dev
```

**后端：**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**智能合约：**
```bash
cd contracts
npm install
npx hardhat compile
npx hardhat test
npx hardhat node  # 本地测试网络
```

### 环境变量

**前端 (.env)：**
```
VITE_API_URL=http://localhost:8000/api/v1
VITE_CHAIN_ID=80002
VITE_RPC_URL=https://rpc-amoy.polygon.technology/
VITE_CONTRACT_ADDRESS=0x...
```

**后端 (.env)：**
```
DATABASE_URL=postgresql://user:password@localhost:5432/nft_marketplace
PINATA_API_KEY=your_api_key
PINATA_SECRET_KEY=your_secret_key
WEB3_PROVIDER_URL=https://rpc-amoy.polygon.technology/
CONTRACT_ADDRESS=0x...
SECRET_KEY=your_secret_key
```

### 部署流程

1. **智能合约部署**
   - 部署到Amoy测试网
   - 验证合约
   - 记录合约地址

2. **后端部署**
   - 设置PostgreSQL数据库
   - 运行Flyway迁移
   - 部署FastAPI应用

3. **前端部署**
   - 构建生产版本
   - 部署到CDN/静态托管
   - 配置环境变量

