# 后端部署和测试指南

## ✅ 已完成

后端API已经完整实现！包括：

- ✅ FastAPI RESTful API
- ✅ PostgreSQL数据库集成
- ✅ Flyway数据库迁移
- ✅ 区块链事件索引器
- ✅ 异步处理
- ✅ CORS支持

## 📦 后端结构

```
backend/
├── app/
│   ├── main.py              # FastAPI应用入口
│   ├── config.py            # 配置管理
│   ├── database.py          # 数据库连接
│   ├── models.py            # SQLAlchemy模型
│   ├── schemas.py           # Pydantic schemas
│   ├── crud.py              # 数据库CRUD操作
│   ├── indexer.py           # 区块链索引器
│   └── routers/
│       ├── nfts.py          # NFT API路由
│       └── transactions.py  # 交易API路由
├── migrations/
│   └── V1__initial_schema.sql  # 数据库初始化
├── requirements.txt         # Python依赖
├── flyway.conf             # Flyway配置
├── .env                    # 环境变量
└── start.sh                # 启动脚本
```

## 🚀 快速开始

### 1. 安装Python依赖

```bash
cd backend
pip3 install -r requirements.txt
```

### 2. 安装Flyway

**macOS**:
```bash
brew install flyway
```

**验证安装**:
```bash
flyway -v
```

### 3. 运行数据库迁移

```bash
cd backend
flyway migrate
```

这会创建以下表：
- `nfts` - NFT数据
- `transactions` - 交易记录
- `indexer_state` - 索引器状态

### 4. 启动后端服务

```bash
./start.sh
```

或者手动启动：
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 5. 验证服务

打开浏览器访问：
- API文档: http://localhost:8000/docs
- 健康检查: http://localhost:8000/health

## 📊 API端点

### NFT相关

#### 获取NFT列表
```bash
GET /api/nfts

# 示例
curl "http://localhost:8000/api/nfts?limit=10&sort_by=created_at&sort_order=desc"

# 筛选在售NFT
curl "http://localhost:8000/api/nfts?is_listed=true"

# 按分类筛选
curl "http://localhost:8000/api/nfts?category=art"

# 按拥有者筛选
curl "http://localhost:8000/api/nfts?owner=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
```

#### 获取NFT详情
```bash
GET /api/nfts/{token_id}

# 示例
curl "http://localhost:8000/api/nfts/1"
```

#### 获取市场统计
```bash
GET /api/nfts/stats/summary

# 示例
curl "http://localhost:8000/api/nfts/stats/summary"

# 返回示例
{
  "total_nfts": 10,
  "total_listed": 5,
  "total_sold": 3,
  "total_volume": "300000000000000000",
  "floor_price": "100000000000000000"
}
```

### 交易相关

#### 获取交易列表
```bash
GET /api/transactions

# 示例
curl "http://localhost:8000/api/transactions?limit=20"

# 按NFT筛选
curl "http://localhost:8000/api/transactions?token_id=1"

# 按交易类型筛选
curl "http://localhost:8000/api/transactions?tx_type=buy"

# 按地址筛选
curl "http://localhost:8000/api/transactions?address=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
```

## 🔄 区块链索引器

后端会自动运行索引器，实时同步区块链数据到数据库。

### 工作流程

1. **监听区块** - 每5秒检查新区块
2. **获取事件** - 从合约获取事件日志
3. **处理事件** - 解析事件并更新数据库
4. **获取元数据** - 从IPFS获取NFT元数据
5. **更新状态** - 记录最后索引的区块

### 索引的事件

- `NFTMinted` → 创建NFT记录
- `NFTListed` → 更新挂单状态
- `NFTSold` → 更新拥有者和挂单状态
- `ListingCancelled` → 取消挂单状态
- `NFTBurned` → 标记为已销毁

### 查看索引器日志

启动后端后，控制台会显示索引器日志：

```
🚀 Starting blockchain indexer...
📊 Indexing blocks 1 to 10...
✅ Indexed NFT Minted: Token ID 1
✅ Indexed NFT Listed: Token ID 1, Price 100000000000000000
✅ Indexed up to block 10
⏳ Waiting for new blocks... (current: 10)
```

## 🔗 前端集成

### 更新前端API配置

创建 `frontend/src/services/api.ts`:

```typescript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// NFT API
export const nftApi = {
  // 获取NFT列表
  list: (params?: {
    skip?: number;
    limit?: number;
    category?: string;
    is_listed?: boolean;
    owner?: string;
    creator?: string;
    search?: string;
    sort_by?: string;
    sort_order?: string;
  }) => api.get('/nfts', { params }),
  
  // 获取NFT详情
  get: (tokenId: number) => api.get(`/nfts/${tokenId}`),
  
  // 获取统计数据
  stats: () => api.get('/nfts/stats/summary'),
};

// 交易API
export const transactionApi = {
  // 获取交易列表
  list: (params?: {
    skip?: number;
    limit?: number;
    token_id?: number;
    tx_type?: string;
    address?: string;
  }) => api.get('/transactions', { params }),
};
```

### 更新MarketplacePage

```typescript
import { useEffect, useState } from 'react';
import { nftApi } from '../services/api';

const MarketplacePage = () => {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        const response = await nftApi.list({
          is_listed: true,
          limit: 20,
          sort_by: 'created_at',
          sort_order: 'desc',
        });
        setNfts(response.data.items);
      } catch (error) {
        console.error('Error fetching NFTs:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNFTs();
  }, []);
  
  // ... 渲染逻辑
};
```

## 🧪 测试流程

### 1. 测试数据库连接

```bash
# 使用psql连接
psql -h 64.176.82.230 -U agt_user -d nft

# 查看表
\dt

# 查看NFT数据
SELECT * FROM nfts;

# 查看交易数据
SELECT * FROM transactions;
```

### 2. 测试API

```bash
# 健康检查
curl http://localhost:8000/health

# 获取NFT列表（应该为空）
curl http://localhost:8000/api/nfts

# 获取统计数据
curl http://localhost:8000/api/nfts/stats/summary
```

### 3. 铸造NFT并测试索引

1. 在前端铸造一个NFT
2. 等待5-10秒（索引器间隔）
3. 查看后端日志，应该看到：
   ```
   ✅ Indexed NFT Minted: Token ID 1
   ```
4. 再次调用API：
   ```bash
   curl http://localhost:8000/api/nfts
   ```
5. 应该能看到新铸造的NFT数据

### 4. 测试完整流程

1. **铸造NFT** → 检查 `/api/nfts` 是否有新NFT
2. **挂单出售** → 检查NFT的 `is_listed` 是否为 `true`
3. **购买NFT** → 检查NFT的 `owner` 是否更新
4. **查看交易** → 检查 `/api/transactions` 是否有交易记录

## 📝 数据格式

### NFT响应示例

```json
{
  "id": 1,
  "token_id": 1,
  "token_uri": "ipfs://QmXXX...",
  "name": "My NFT",
  "description": "This is my NFT",
  "image_url": "https://gateway.pinata.cloud/ipfs/QmXXX...",
  "creator": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
  "owner": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
  "category": "art",
  "royalty_percent": 500,
  "is_listed": true,
  "price": "100000000000000000",
  "seller": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
  "is_burned": false,
  "created_at": "2024-01-06T10:00:00Z",
  "updated_at": "2024-01-06T10:05:00Z"
}
```

### 交易响应示例

```json
{
  "id": 1,
  "tx_hash": "0xabc123...",
  "block_number": 100,
  "tx_type": "mint",
  "token_id": 1,
  "from_address": null,
  "to_address": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
  "price": null,
  "timestamp": "2024-01-06T10:00:00Z",
  "created_at": "2024-01-06T10:00:05Z"
}
```

## 🔧 故障排除

### 数据库连接失败

**错误**: `could not connect to server`

**解决**:
1. 检查数据库服务器是否可访问
2. 检查防火墙设置
3. 验证数据库URL中的密码编码（`?` → `%3F`）

### 索引器不工作

**错误**: 索引器没有同步数据

**解决**:
1. 检查Hardhat节点是否运行
2. 检查RPC_URL配置
3. 检查CONTRACT_ADDRESS是否正确
4. 查看后端日志的错误信息

### CORS错误

**错误**: 前端无法访问API

**解决**:
在 `.env` 中添加前端URL：
```env
CORS_ORIGINS=http://localhost:5173,http://localhost:5174
```

### Flyway迁移失败

**错误**: `Flyway migration failed`

**解决**:
1. 检查数据库连接
2. 检查flyway.conf配置
3. 手动运行SQL查看错误：
   ```bash
   psql -h 64.176.82.230 -U agt_user -d nft -f migrations/V1__initial_schema.sql
   ```

## 🎯 下一步

1. **启动所有服务**:
   - Hardhat节点: `cd contracts && npm run node`
   - 后端API: `cd backend && ./start.sh`
   - 前端: `cd frontend && npm run dev`

2. **测试完整流程**:
   - 连接钱包
   - 铸造NFT
   - 查看API是否同步数据
   - 测试挂单、购买等功能

3. **集成前端**:
   - 创建API服务层
   - 更新页面使用真实API
   - 替换mock数据

4. **优化和部署**:
   - 添加缓存
   - 添加错误处理
   - 部署到生产环境

祝部署顺利！🚀
