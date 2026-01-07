#!/bin/bash

echo "🚀 Starting NFT Marketplace Backend..."

# 检查Python依赖
if ! python -c "import fastapi" 2>/dev/null; then
    echo "📦 Installing Python dependencies..."
    pip install -r requirements.txt
fi

# 启动服务
echo "✅ Starting API server on http://localhost:8000"
echo "📚 API docs: http://localhost:8000/docs"
echo ""

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
