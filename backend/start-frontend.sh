#!/bin/bash

echo "🚀 启动后端服务（前台模式）"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 配置信息:"
echo "   合约地址: $(grep CONTRACT_ADDRESS .env | cut -d'=' -f2)"
echo "   RPC URL: $(grep RPC_URL .env | cut -d'=' -f2)"
echo "   起始区块: $(grep INDEXER_START_BLOCK .env | cut -d'=' -f2)"
echo ""
echo "🌐 服务地址:"
echo "   API: http://localhost:8000"
echo "   文档: http://localhost:8000/docs"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 激活虚拟环境
source ~/.envs/nfts/bin/activate

# 启动服务（前台）
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
