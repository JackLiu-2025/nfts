#!/bin/bash

echo "🔄 重新部署后端服务..."
echo ""

# 停止旧容器
echo "🛑 停止旧容器..."
docker-compose down

echo ""
echo "📦 重新构建镜像（包含 ABI 文件）..."
docker-compose build --no-cache

echo ""
echo "🚀 启动服务..."
docker-compose up -d

echo ""
echo "⏳ 等待服务启动..."
sleep 5

echo ""
echo "📊 查看日志..."
docker-compose logs --tail=50

echo ""
echo "✅ 重新部署完成！"
echo ""
echo "查看实时日志: docker-compose logs -f"
