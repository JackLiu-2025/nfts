#!/bin/bash

# NFT Marketplace Backend 部署脚本

set -e

echo "🚀 NFT Marketplace Backend Deployment"
echo "======================================"

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# 检查 Docker Compose 是否安装
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# 检查 .env 文件是否存在
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create .env file first."
    echo "You can copy from .env.example:"
    echo "  cp .env.example .env"
    exit 1
fi

# 选择部署模式
echo ""
echo "Select deployment mode:"
echo "1) Development (docker-compose.yml)"
echo "2) Production (docker-compose.prod.yml)"
read -p "Enter choice [1-2]: " choice

case $choice in
    1)
        COMPOSE_FILE="docker-compose.yml"
        MODE="development"
        ;;
    2)
        COMPOSE_FILE="docker-compose.prod.yml"
        MODE="production"
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "📦 Building Docker image for $MODE mode..."
docker-compose -f $COMPOSE_FILE build

echo ""
echo "🔄 Starting services..."
docker-compose -f $COMPOSE_FILE up -d

echo ""
echo "⏳ Waiting for service to be ready..."
sleep 5

# 健康检查
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -f http://localhost:8000/health &> /dev/null; then
        echo ""
        echo "✅ Service is ready!"
        echo ""
        echo "📊 Service Information:"
        echo "  - API URL: http://localhost:8000"
        echo "  - API Docs: http://localhost:8000/docs"
        echo "  - Health Check: http://localhost:8000/health"
        echo ""
        echo "📝 Useful commands:"
        echo "  - View logs: docker-compose -f $COMPOSE_FILE logs -f"
        echo "  - Stop service: docker-compose -f $COMPOSE_FILE down"
        echo "  - Restart service: docker-compose -f $COMPOSE_FILE restart"
        echo ""
        exit 0
    fi
    
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "Waiting for service... ($RETRY_COUNT/$MAX_RETRIES)"
    sleep 2
done

echo ""
echo "❌ Service failed to start. Check logs:"
echo "  docker-compose -f $COMPOSE_FILE logs"
exit 1
