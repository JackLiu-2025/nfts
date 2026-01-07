#!/bin/bash

# 等待数据库就绪
echo "⏳ Waiting for database to be ready..."
until PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c '\q' 2>/dev/null; do
  echo "Database is unavailable - sleeping"
  sleep 2
done

echo "✅ Database is ready!"

# 启动应用
echo "🚀 Starting NFT Marketplace API..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
