#!/bin/bash

# ============================================
# NFT Marketplace Backend 部署脚本
# 目标服务器: 64.176.82.230:8002
# ============================================

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置
SERVER_IP="64.176.82.230"
SERVER_USER="root"  # 根据实际情况修改
SERVER_PORT="22"    # SSH 端口
DEPLOY_PATH="/opt/nft-marketplace/backend"
CONTAINER_NAME="nft-marketplace-backend"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🚀 NFT Marketplace Backend 部署${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 检查必要文件
echo -e "${YELLOW}1️⃣  检查必要文件...${NC}"
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ 错误: .env 文件不存在${NC}"
    echo -e "${YELLOW}   请先创建 .env 文件并配置环境变量${NC}"
    exit 1
fi

if [ ! -f "Dockerfile" ]; then
    echo -e "${RED}❌ 错误: Dockerfile 不存在${NC}"
    exit 1
fi

if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ 错误: docker-compose.yml 不存在${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 文件检查通过${NC}"
echo ""

# 询问是否继续
echo -e "${YELLOW}2️⃣  部署信息确认${NC}"
echo "   服务器: ${SERVER_IP}"
echo "   端口: 8002"
echo "   路径: ${DEPLOY_PATH}"
echo ""
read -p "确认部署到生产服务器？(yes/no): " -r
echo ""
if [[ ! $REPLY =~ ^[Yy]es$ ]]; then
    echo -e "${YELLOW}❌ 部署已取消${NC}"
    exit 0
fi

# 创建部署目录
echo -e "${YELLOW}3️⃣  创建服务器目录...${NC}"
ssh -p ${SERVER_PORT} ${SERVER_USER}@${SERVER_IP} "mkdir -p ${DEPLOY_PATH}"
echo -e "${GREEN}✅ 目录创建完成${NC}"
echo ""

# 上传文件
echo -e "${YELLOW}4️⃣  上传文件到服务器...${NC}"
rsync -avz --progress \
    --exclude='__pycache__' \
    --exclude='*.pyc' \
    --exclude='venv' \
    --exclude='.pytest_cache' \
    --exclude='*.log' \
    -e "ssh -p ${SERVER_PORT}" \
    ./ ${SERVER_USER}@${SERVER_IP}:${DEPLOY_PATH}/

echo -e "${GREEN}✅ 文件上传完成${NC}"
echo ""

# 在服务器上构建和启动
echo -e "${YELLOW}5️⃣  在服务器上构建和启动容器...${NC}"
ssh -p ${SERVER_PORT} ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
cd /opt/nft-marketplace/backend

# 停止旧容器
echo "停止旧容器..."
docker-compose down || true

# 清理旧镜像（可选）
# docker image prune -f

# 构建新镜像
echo "构建新镜像..."
docker-compose build

# 启动容器
echo "启动容器..."
docker-compose up -d

# 等待容器启动
echo "等待容器启动..."
sleep 10

# 检查容器状态
echo "检查容器状态..."
docker-compose ps

# 查看日志
echo "最近的日志:"
docker-compose logs --tail=50

ENDSSH

echo -e "${GREEN}✅ 容器启动完成${NC}"
echo ""

# 健康检查
echo -e "${YELLOW}6️⃣  健康检查...${NC}"
sleep 5
if curl -f http://${SERVER_IP}:8002/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 服务运行正常${NC}"
else
    echo -e "${RED}⚠️  健康检查失败，请查看日志${NC}"
    echo -e "${YELLOW}   查看日志: ssh ${SERVER_USER}@${SERVER_IP} 'cd ${DEPLOY_PATH} && docker-compose logs'${NC}"
fi
echo ""

# 完成
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 部署完成！${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📋 服务信息:"
echo "   API 地址: http://${SERVER_IP}:8002"
echo "   API 文档: http://${SERVER_IP}:8002/docs"
echo "   健康检查: http://${SERVER_IP}:8002/health"
echo ""
echo "📝 常用命令:"
echo "   查看日志: ssh ${SERVER_USER}@${SERVER_IP} 'cd ${DEPLOY_PATH} && docker-compose logs -f'"
echo "   重启服务: ssh ${SERVER_USER}@${SERVER_IP} 'cd ${DEPLOY_PATH} && docker-compose restart'"
echo "   停止服务: ssh ${SERVER_USER}@${SERVER_IP} 'cd ${DEPLOY_PATH} && docker-compose down'"
echo "   查看状态: ssh ${SERVER_USER}@${SERVER_IP} 'cd ${DEPLOY_PATH} && docker-compose ps'"
echo ""
