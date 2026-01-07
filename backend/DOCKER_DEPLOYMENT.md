# NFT Marketplace Backend - Docker 部署指南

## 前置要求

- Docker 20.10+
- Docker Compose 2.0+
- 外部 PostgreSQL 数据库（已配置）

## 快速开始

### 1. 配置环境变量

确保 `.env` 文件已正确配置：

```bash
# 数据库配置（外部数据库）
DATABASE_URL=postgresql+asyncpg://agt_user:Agt2025%3F@64.176.82.230:5432/nt

# 区块链配置
CONTRACT_ADDRESS=0xB70b8bd1Fe19464b440C352a89A664314b8Fe4B5
RPC_URL=https://rpc-amoy.polygon.technology/
CHAIN_ID=80002

# IPFS配置
IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/

# API配置
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://your-frontend-domain.com

# 索引器配置
INDEXER_START_BLOCK=0
INDEXER_INTERVAL=30
MAX_BLOCK_RANGE=50
```

### 2. 构建镜像

```bash
cd backend
docker-compose build
```

### 3. 启动服务

```bash
docker-compose up -d
```

### 4. 查看日志

```bash
# 查看所有日志
docker-compose logs -f

# 查看最近100行日志
docker-compose logs --tail=100 -f
```

### 5. 停止服务

```bash
docker-compose down
```

## Docker 命令参考

### 构建和启动

```bash
# 构建镜像
docker-compose build

# 启动服务（后台运行）
docker-compose up -d

# 启动服务（前台运行，查看日志）
docker-compose up

# 重新构建并启动
docker-compose up -d --build
```

### 管理容器

```bash
# 查看运行状态
docker-compose ps

# 停止服务
docker-compose stop

# 启动已停止的服务
docker-compose start

# 重启服务
docker-compose restart

# 停止并删除容器
docker-compose down

# 停止并删除容器、网络、镜像
docker-compose down --rmi all
```

### 日志和调试

```bash
# 查看日志
docker-compose logs

# 实时查看日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs backend

# 进入容器
docker-compose exec backend bash

# 查看容器资源使用
docker stats nft-marketplace-backend
```

### 健康检查

```bash
# 检查健康状态
docker inspect --format='{{.State.Health.Status}}' nft-marketplace-backend

# 测试 API
curl http://localhost:8000/health
curl http://localhost:8000/
```

## 生产环境部署

### 1. 使用生产环境配置

创建 `docker-compose.prod.yml`：

```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: nft-marketplace-backend
    ports:
      - "8000:8000"
    env_file:
      - .env.production
    restart: always
    networks:
      - nft-network
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G

networks:
  nft-network:
    driver: bridge
```

### 2. 启动生产环境

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 3. 配置反向代理（Nginx）

```nginx
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 故障排查

### 容器无法启动

```bash
# 查看详细日志
docker-compose logs backend

# 检查配置
docker-compose config

# 验证环境变量
docker-compose exec backend env
```

### 数据库连接失败

```bash
# 测试数据库连接
docker-compose exec backend python -c "
from app.database import engine
import asyncio
asyncio.run(engine.connect())
"
```

### 索引器问题

```bash
# 查看索引器日志
docker-compose logs backend | grep "Indexing"

# 检查区块链连接
docker-compose exec backend python -c "
from web3 import Web3
w3 = Web3(Web3.HTTPProvider('https://rpc-amoy.polygon.technology/'))
print(f'Connected: {w3.is_connected()}')
print(f'Latest block: {w3.eth.block_number}')
"
```

## 性能优化

### 1. 资源限制

在 `docker-compose.yml` 中添加：

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
```

### 2. 日志管理

```yaml
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### 3. 健康检查优化

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 10s
```

## 监控和维护

### 查看资源使用

```bash
docker stats nft-marketplace-backend
```

### 清理未使用的资源

```bash
# 清理未使用的镜像
docker image prune -a

# 清理未使用的容器
docker container prune

# 清理所有未使用的资源
docker system prune -a
```

### 备份和恢复

```bash
# 导出镜像
docker save nft-marketplace-backend > backend-image.tar

# 导入镜像
docker load < backend-image.tar
```

## 安全建议

1. **不要在镜像中包含敏感信息**
   - 使用 `.env` 文件管理环境变量
   - 不要提交 `.env` 到版本控制

2. **使用非 root 用户运行**
   - 在 Dockerfile 中添加用户

3. **定期更新依赖**
   ```bash
   pip list --outdated
   ```

4. **使用 HTTPS**
   - 配置 SSL 证书
   - 使用反向代理

5. **限制网络访问**
   - 使用防火墙规则
   - 配置 Docker 网络隔离

## 常见问题

### Q: 如何更新应用？

```bash
# 1. 拉取最新代码
git pull

# 2. 重新构建镜像
docker-compose build

# 3. 重启服务
docker-compose up -d
```

### Q: 如何查看应用版本？

```bash
curl http://localhost:8000/
```

### Q: 如何修改端口？

修改 `docker-compose.yml` 中的端口映射：
```yaml
ports:
  - "9000:8000"  # 主机端口:容器端口
```

### Q: 如何连接到容器内部？

```bash
docker-compose exec backend bash
```

## 相关链接

- [Docker 文档](https://docs.docker.com/)
- [Docker Compose 文档](https://docs.docker.com/compose/)
- [FastAPI 部署指南](https://fastapi.tiangolo.com/deployment/)
