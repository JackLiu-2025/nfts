#!/bin/bash

# Docker 部署测试脚本

echo "🧪 Testing Docker Deployment"
echo "============================"

# 检查 Docker
echo ""
echo "1️⃣ Checking Docker..."
if command -v docker &> /dev/null; then
    echo "✅ Docker is installed"
    docker --version
else
    echo "❌ Docker is not installed"
    exit 1
fi

# 检查 Docker Compose
echo ""
echo "2️⃣ Checking Docker Compose..."
if command -v docker-compose &> /dev/null; then
    echo "✅ Docker Compose is installed"
    docker-compose --version
else
    echo "❌ Docker Compose is not installed"
    exit 1
fi

# 检查 .env 文件
echo ""
echo "3️⃣ Checking .env file..."
if [ -f .env ]; then
    echo "✅ .env file exists"
else
    echo "❌ .env file not found"
    echo "Please create .env file from .env.example"
    exit 1
fi

# 检查必需的环境变量
echo ""
echo "4️⃣ Checking required environment variables..."
source .env
REQUIRED_VARS=("DATABASE_URL" "CONTRACT_ADDRESS" "RPC_URL" "CHAIN_ID")
ALL_PRESENT=true

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ $var is not set"
        ALL_PRESENT=false
    else
        echo "✅ $var is set"
    fi
done

if [ "$ALL_PRESENT" = false ]; then
    echo "❌ Some required environment variables are missing"
    exit 1
fi

# 测试 Dockerfile 语法
echo ""
echo "5️⃣ Validating Dockerfile..."
if docker build -t test-backend -f Dockerfile . --no-cache > /dev/null 2>&1; then
    echo "✅ Dockerfile is valid"
    docker rmi test-backend > /dev/null 2>&1
else
    echo "❌ Dockerfile has errors"
    exit 1
fi

# 测试 docker-compose 配置
echo ""
echo "6️⃣ Validating docker-compose.yml..."
if docker-compose config > /dev/null 2>&1; then
    echo "✅ docker-compose.yml is valid"
else
    echo "❌ docker-compose.yml has errors"
    exit 1
fi

echo ""
echo "✅ All checks passed!"
echo ""
echo "You can now deploy with:"
echo "  ./deploy.sh"
echo "or"
echo "  make build && make up"
