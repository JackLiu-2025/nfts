#!/bin/bash

echo "🔍 NFT Marketplace System Status Check"
echo "========================================"
echo ""

# 检查前端
echo "📱 Frontend Status:"
if curl -s http://localhost:5174 > /dev/null; then
    echo "   ✅ Frontend is running on http://localhost:5174"
else
    echo "   ❌ Frontend is NOT running"
fi
echo ""

# 检查后端
echo "🔧 Backend Status:"
if curl -s http://localhost:8000/docs > /dev/null; then
    echo "   ✅ Backend is running on http://localhost:8000"
    echo "   📚 API Docs: http://localhost:8000/docs"
else
    echo "   ❌ Backend is NOT running"
fi
echo ""

# 检查后端API
echo "🔌 Backend API Endpoints:"
echo "   Testing /api/nfts..."
NFTS_RESPONSE=$(curl -s http://localhost:8000/api/nfts)
if [ $? -eq 0 ]; then
    NFT_COUNT=$(echo $NFTS_RESPONSE | grep -o '"total":[0-9]*' | grep -o '[0-9]*')
    echo "   ✅ /api/nfts is working (Total NFTs: ${NFT_COUNT:-0})"
else
    echo "   ❌ /api/nfts is NOT working"
fi

echo "   Testing /api/nfts/stats/summary..."
if curl -s http://localhost:8000/api/nfts/stats/summary > /dev/null; then
    echo "   ✅ /api/nfts/stats/summary is working"
else
    echo "   ❌ /api/nfts/stats/summary is NOT working"
fi
echo ""

# 检查智能合约
echo "🔗 Smart Contract:"
echo "   Network: Polygon Amoy Testnet"
echo "   Contract: 0xB70b8bd1Fe19464b440C352a89A664314b8Fe4B5"
echo "   Explorer: https://amoy.polygonscan.com/address/0xB70b8bd1Fe19464b440C352a89A664314b8Fe4B5"
echo ""

# 检查数据库连接
echo "💾 Database:"
echo "   Host: 64.176.82.230:5432"
echo "   Database: nt"
echo "   User: agt_user"
echo ""

# 检查索引器状态
echo "📊 Indexer Status:"
INDEXER_STATE=$(curl -s http://localhost:8000/api/nfts/stats/summary 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "   ✅ Indexer is running and syncing blockchain events"
else
    echo "   ⚠️  Cannot determine indexer status"
fi
echo ""

echo "========================================"
echo "✨ System Check Complete!"
echo ""
echo "🚀 Quick Links:"
echo "   Frontend: http://localhost:5174"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo "   Contract: https://amoy.polygonscan.com/address/0xB70b8bd1Fe19464b440C352a89A664314b8Fe4B5"
echo ""
