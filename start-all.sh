#!/bin/bash

echo "🚀 启动 NFT Marketplace"
echo "================================"
echo ""

echo "📋 检查服务状态..."
echo ""

# 检查前端
if lsof -Pi :5174 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ 前端已在运行: http://localhost:5174"
else
    echo "⚠️  前端未运行"
fi

# 检查后端
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ 后端已在运行: http://localhost:8000"
else
    echo "⚠️  后端未运行"
fi

echo ""
echo "📝 配置信息:"
echo "  - 网络: Polygon Amoy Testnet"
echo "  - Chain ID: 80002"
echo "  - 合约地址: 0xB70b8bd1Fe19464b440C352a89A664314b8Fe4B5"
echo "  - RPC: https://rpc-amoy.polygon.technology/"
echo ""
echo "🔗 重要链接:"
echo "  - 前端: http://localhost:5174"
echo "  - 后端 API: http://localhost:8000"
echo "  - API 文档: http://localhost:8000/docs"
echo "  - 区块浏览器: https://amoy.polygonscan.com/address/0xB70b8bd1Fe19464b440C352a89A664314b8Fe4B5"
echo "  - 测试币水龙头: https://faucet.polygon.technology/"
echo ""
echo "📚 使用指南:"
echo "  1. 在 MetaMask 中添加 Polygon Amoy 测试网"
echo "  2. 从水龙头获取测试 MATIC"
echo "  3. 访问 http://localhost:5174"
echo "  4. 连接钱包并开始使用"
echo ""
echo "✨ 准备就绪！"
