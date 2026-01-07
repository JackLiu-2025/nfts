#!/bin/bash

echo "🔄 重启 NFT 市场服务（使用新合约）"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 新合约地址
NEW_CONTRACT="0x4681BE5B76bACF483Ec7d6f228f6F4C31394c761"
echo "📋 新合约地址: $NEW_CONTRACT"
echo ""

# 检查是否在项目根目录
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    exit 1
fi

echo "1️⃣  停止现有服务..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 停止后端
echo "   停止后端..."
pkill -f "uvicorn app.main:app" 2>/dev/null || echo "   后端未运行"

# 停止前端
echo "   停止前端..."
pkill -f "vite" 2>/dev/null || echo "   前端未运行"

sleep 2
echo ""

echo "2️⃣  清理数据库（可选）..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
read -p "   是否清空数据库重新开始？(y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "   清空数据库..."
    cd backend
    source ~/.envs/nfts/bin/activate
    python -c "
import asyncio
from app.database import engine, Base

async def reset_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    print('   ✅ 数据库已重置')

asyncio.run(reset_db())
    "
    cd ..
else
    echo "   ⏭️  跳过数据库清理"
fi
echo ""

echo "3️⃣  启动后端服务..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cd backend
source ~/.envs/nfts/bin/activate

# 启动后端（后台运行）
nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "   ✅ 后端已启动 (PID: $BACKEND_PID)"
echo "   📝 日志: backend.log"
cd ..
echo ""

sleep 3

echo "4️⃣  启动前端服务..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cd frontend

# 启动前端（后台运行）
nohup npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   ✅ 前端已启动 (PID: $FRONTEND_PID)"
echo "   📝 日志: frontend.log"
cd ..
echo ""

sleep 3

echo "5️⃣  验证服务状态..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 检查后端
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "   ✅ 后端运行正常: http://localhost:8000"
else
    echo "   ⚠️  后端可能未就绪，请检查 backend.log"
fi

# 检查前端
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "   ✅ 前端运行正常: http://localhost:5173"
else
    echo "   ⚠️  前端可能未就绪，请检查 frontend.log"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 服务重启完成！"
echo ""
echo "📱 访问应用:"
echo "   前端: http://localhost:5173"
echo "   后端: http://localhost:8000"
echo "   API文档: http://localhost:8000/docs"
echo ""
echo "📋 新合约信息:"
echo "   地址: $NEW_CONTRACT"
echo "   浏览器: https://amoy.polygonscan.com/address/$NEW_CONTRACT"
echo ""
echo "📝 查看日志:"
echo "   后端: tail -f backend.log"
echo "   前端: tail -f frontend.log"
echo ""
echo "🛑 停止服务:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""
