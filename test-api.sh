#!/bin/bash

echo "🧪 测试 NFT Marketplace API"
echo "================================"
echo ""

echo "1️⃣ 测试健康检查..."
curl -s http://localhost:8000/health | jq .
echo ""

echo "2️⃣ 测试 NFT 列表..."
curl -s http://localhost:8000/api/nfts | jq .
echo ""

echo "3️⃣ 测试市场统计..."
curl -s http://localhost:8000/api/nfts/stats/summary | jq .
echo ""

echo "4️⃣ 测试交易列表..."
curl -s http://localhost:8000/api/transactions | jq .
echo ""

echo "✅ API 测试完成！"
echo ""
echo "📝 提示："
echo "  - 如果看到空列表，说明还没有 NFT"
echo "  - 请在前端铸造一个 NFT 来测试完整流程"
echo "  - 访问 http://localhost:5174 开始使用"
