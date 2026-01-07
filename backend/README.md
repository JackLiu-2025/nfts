# NFT Marketplace Backend API

FastAPI后端服务，提供NFT数据索引和API接口。

## 功能特性

- ✅ 区块链事件索引（自动同步合约数据）
- ✅ RESTful API接口
- ✅ PostgreSQL数据库存储
- ✅ Flyway数据库迁移
- ✅ 异步处理
- ✅ CORS支持

## 技术栈

- **FastAPI** - 现代Python Web框架
- **SQLAlchemy** - ORM
- **PostgreSQL** - 数据库
- **Flyway** - 数据库迁移
- **Web3.py** - 区块链交互
- **Uvicorn** - ASGI服务器

## 安装

### 1. 安装Python依赖

```bash
cd backend
pip install -r requirements.txt
```

### 2. 安装Flyway

**macOS (使用Homebrew)**:
```bash
brew install flyway
```

**Linux**:
```bash
wget -qO- https://repo1.maven.org/maven2/org/flywaydb/flyway-commandline/10.4.1/flyway-commandline-10.4.1-linux-x64.tar.gz | tar xvz
sudo ln -s `pwd`/flyway-10.4.1/flyway /usr/local/bin
```

**Windows**:
下载并解压: https://flywaydb.org/download

### 3. 配置环境变量

复制 `.env.example` 到 `.env` 并配置：

```bash
cp .env.example .env
```

编辑 `.env`:
```env
DATABASE_URL=postgresql+asyncpg://agt_user:Agt2025%3F@64.176.82.230:5432/nft
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
RPC_URL=http://localhost:8545
CHAIN_ID=1337
```

**注意**: 密码中的特殊字符需要URL编码：
- `?` → `%3F`
- `@` → `%40`
- `#` → `%23`

### 4. 运行数据库迁移

```bash
# 配置Flyway
export FLYWAY_URL="jdbc:postgresql://64.176.82.230:5432/nft"
export FLYWAY_USER="agt_user"
export FLYWAY_PASSWORD="Agt2025?"

# 运行迁移
flyway -locations=filesystem:./migrations migrate
```

或者使用配置文件：

创建 `flyway.conf`:
```conf
flyway.url=jdbc:postgresql://64.176.82.230:5432/nft
flyway.user=agt_user
flyway.password=Agt2025?
flyway.locations=filesystem:./migrations
```

然后运行：
```bash
flyway migrate
```

## 运行

### 开发模式

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 生产模式

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## API文档

启动服务后访问：

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API端点

### NFTs

- `GET /api/nfts` - 获取NFT列表
  - 查询参数:
    - `skip`: 跳过数量（分页）
    - `limit`: 每页数量
    - `category`: 分类筛选
    - `is_listed`: 是否在售
    - `owner`: 拥有者地址
    - `creator`: 创作者地址
    - `search`: 搜索关键词
    - `sort_by`: 排序字段 (created_at, price, token_id)
    - `sort_order`: 排序方向 (asc, desc)

- `GET /api/nfts/{token_id}` - 获取NFT详情

- `GET /api/nfts/stats/summary` - 获取市场统计

### Transactions

- `GET /api/transactions` - 获取交易列表
  - 查询参数:
    - `skip`: 跳过数量
    - `limit`: 每页数量
    - `token_id`: NFT ID筛选
    - `tx_type`: 交易类型 (mint, list, buy, cancel, burn)
    - `address`: 地址筛选

## 区块链索引器

后端会自动运行索引器，监听智能合约事件并同步到数据库。

### 索引的事件

- `NFTMinted` - NFT铸造
- `NFTListed` - NFT挂单
- `NFTSold` - NFT售出
- `ListingCancelled` - 取消挂单
- `NFTBurned` - NFT销毁

### 索引器配置

在 `.env` 中配置：

```env
INDEXER_START_BLOCK=0        # 开始索引的区块
INDEXER_INTERVAL=5           # 检查间隔（秒）
```

## 数据库Schema

### nfts表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL | 主键 |
| token_id | INTEGER | NFT Token ID |
| token_uri | TEXT | 元数据URI |
| name | VARCHAR(200) | NFT名称 |
| description | TEXT | 描述 |
| image_url | TEXT | 图片URL |
| creator | VARCHAR(42) | 创作者地址 |
| owner | VARCHAR(42) | 拥有者地址 |
| category | VARCHAR(50) | 分类 |
| royalty_percent | INTEGER | 版税（基点） |
| is_listed | BOOLEAN | 是否在售 |
| price | NUMERIC(78,0) | 价格（Wei） |
| seller | VARCHAR(42) | 卖家地址 |
| is_burned | BOOLEAN | 是否已销毁 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### transactions表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL | 主键 |
| tx_hash | VARCHAR(66) | 交易哈希 |
| block_number | INTEGER | 区块号 |
| tx_type | VARCHAR(20) | 交易类型 |
| token_id | INTEGER | NFT Token ID |
| from_address | VARCHAR(42) | 发送方地址 |
| to_address | VARCHAR(42) | 接收方地址 |
| price | NUMERIC(78,0) | 价格（Wei） |
| timestamp | TIMESTAMP | 交易时间 |
| created_at | TIMESTAMP | 创建时间 |

## 开发

### 项目结构

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py           # FastAPI应用
│   ├── config.py         # 配置
│   ├── database.py       # 数据库连接
│   ├── models.py         # SQLAlchemy模型
│   ├── schemas.py        # Pydantic schemas
│   ├── crud.py           # 数据库操作
│   ├── indexer.py        # 区块链索引器
│   └── routers/
│       ├── nfts.py       # NFT路由
│       └── transactions.py # 交易路由
├── migrations/           # Flyway迁移文件
│   └── V1__initial_schema.sql
├── requirements.txt      # Python依赖
├── .env                  # 环境变量
└── README.md
```

### 添加新的迁移

创建新的SQL文件，命名格式：`VX__description.sql`

例如：`V2__add_favorites.sql`

```sql
CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    user_address VARCHAR(42) NOT NULL,
    token_id INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_address, token_id)
);
```

然后运行：
```bash
flyway migrate
```

## 测试

### 测试API

```bash
# 健康检查
curl http://localhost:8000/health

# 获取NFT列表
curl http://localhost:8000/api/nfts

# 获取NFT详情
curl http://localhost:8000/api/nfts/1

# 获取统计数据
curl http://localhost:8000/api/nfts/stats/summary

# 获取交易列表
curl http://localhost:8000/api/transactions
```

## 部署

### 使用Docker

创建 `Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

构建和运行：

```bash
docker build -t nft-marketplace-api .
docker run -p 8000:8000 --env-file .env nft-marketplace-api
```

### 使用systemd

创建 `/etc/systemd/system/nft-api.service`:

```ini
[Unit]
Description=NFT Marketplace API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/backend
Environment="PATH=/path/to/venv/bin"
ExecStart=/path/to/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

启动服务：

```bash
sudo systemctl enable nft-api
sudo systemctl start nft-api
sudo systemctl status nft-api
```

## 故障排除

### 数据库连接失败

检查：
1. 数据库URL是否正确
2. 密码中的特殊字符是否已URL编码
3. 数据库服务器是否可访问
4. 防火墙设置

### 索引器不工作

检查：
1. Hardhat节点是否运行
2. RPC_URL是否正确
3. CONTRACT_ADDRESS是否正确
4. 查看日志输出

### CORS错误

在 `.env` 中添加前端URL：

```env
CORS_ORIGINS=http://localhost:5173,http://localhost:5174,https://yourdomain.com
```

## License

MIT
