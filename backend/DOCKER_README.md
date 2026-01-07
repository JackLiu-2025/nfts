# NFT Marketplace Backend - Docker 快速指南

## 🚀 快速开始

### 方法 1: 使用部署脚本（推荐）

```bash
cd backend
./deploy.sh
```

选择部署模式：
- `1` - 开发环境
- `2` - 生产环境

### 方法 2: 使用 Make 命令

```bash
cd backend

# 构建并启动
make build
make up

# 查看日志
make logs

# 停止服务
make down
```

### 方法 3: 使用 Docker Compose

```bash
cd backend

# 开发环境
docker-compose up -d

# 生产环境
docker-compose -f docker-compose.prod.yml up -d
```

## 📋 常用命令

### 开发环境

```bash
# 构建镜像
make build
# 或
docker-compose build

# 启动服务
make up
# 或
docker-compose up -d

# 查看日志
make logs
# 或
docker-compose logs -f

# 停止服务
make down
# 或
docker-compose down

# 重启服务
make restart
# 或
docker-compose restart

# 进入容器
make shell
# 或
docker-compose exec backend bash

# 健康检查
make health
# 或
curl http://localhost:8000/health
```

### 生产环境

```bash
# 构建生产镜像
make prod-build
# 或
docker-compose -f docker-compose.prod.yml build

# 启动生产服务
make prod-up
# 或
docker-compose -f docker-compose.prod.yml up -d

# 查看生产日志
make prod-logs
# 或
docker-compose -f docker-compose.prod.yml logs -f

# 停止生产服务
make prod-down
# 或
docker-compose -f docker-compose.prod.yml down
```

## 🔧 配置说明

### 环境变量

确保 `.env` 文件已正确配置：

```env
# 数据库（外部）
DATABASE_URL=postgresql+asyncpg://user:password@host:5432/dbname

# 区块链
CONTRACT_ADDRESS=0x...
RPC_URL=https://rpc-amoy.polygon.technology/
CHAIN_ID=80002

# IPFS
IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/

# API
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=http://localhost:5173,http://localhost:5174

# 索引器
INDEXER_START_BLOCK=0
INDEXER_INTERVAL=30
MAX_BLOCK_RANGE=50
```

### 端口配置

默认端口：`8000`

修改端口：编辑 `docker-compose.yml`
```yaml
ports:
  - "9000:8000"  # 主机端口:容器端口
```

## 📊 监控和调试

### 查看服务状态

```bash
docker-compose ps
```

### 查看资源使用

```bash
docker stats nft-marketplace-backend
```

### 查看详细日志

```bash
# 所有日志
docker-compose logs

# 最近100行
docker-compose logs --tail=100

# 实时日志
docker-compose logs -f

# 特定时间范围
docker-compose logs --since 30m
```

### 进入容器调试

```bash
docker-compose exec backend bash

# 在容器内
python -c "from app.database import engine; print('DB OK')"
python -c "from web3 import Web3; w3 = Web3(Web3.HTTPProvider('https://rpc-amoy.polygon.technology/')); print(f'Connected: {w3.is_connected()}')"
```

## 🔍 故障排查

### 容器无法启动

```bash
# 查看详细错误
docker-compose logs backend

# 检查配置
docker-compose config

# 重新构建
docker-compose build --no-cache
docker-compose up -d
```

### 数据库连接失败

1. 检查 `.env` 中的 `DATABASE_URL`
2. 确保数据库可以从 Docker 容器访问
3. 测试连接：
```bash
docker-compose exec backend python -c "
from sqlalchemy import create_engine
engine = create_engine('postgresql://user:pass@host:5432/db')
conn = engine.connect()
print('Connected!')
"
```

### 端口被占用

```bash
# 查看端口占用
lsof -i :8000

# 修改端口或停止占用进程
```

## 🧹 清理

### 停止并删除容器

```bash
make down
# 或
docker-compose down
```

### 完全清理

```bash
make clean
# 或
docker-compose down --rmi all -v
docker system prune -a
```

## 📦 文件说明

- `Dockerfile` - 开发环境镜像
- `Dockerfile.prod` - 生产环境镜像（多阶段构建，优化）
- `docker-compose.yml` - 开发环境配置
- `docker-compose.prod.yml` - 生产环境配置
- `.dockerignore` - Docker 构建忽略文件
- `deploy.sh` - 自动部署脚本
- `Makefile` - Make 命令快捷方式

## 🌐 访问服务

启动成功后：

- **API 根路径**: http://localhost:8000
- **API 文档**: http://localhost:8000/docs
- **健康检查**: http://localhost:8000/health

## 💡 提示

1. **开发环境** 使用 `docker-compose.yml`，单进程，便于调试
2. **生产环境** 使用 `docker-compose.prod.yml`，多进程，性能优化
3. 修改代码后需要重新构建镜像：`make build && make up`
4. 使用 `make logs` 实时查看日志
5. 生产环境建议配置 Nginx 反向代理和 SSL

## 🔐 安全建议

1. 不要将 `.env` 文件提交到版本控制
2. 使用强密码
3. 限制容器资源使用
4. 定期更新依赖
5. 配置防火墙规则
6. 使用 HTTPS

## 📚 更多信息

详细文档请查看：
- [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md) - 完整部署指南
- [README.md](./README.md) - 项目说明
