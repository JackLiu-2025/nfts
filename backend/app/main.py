from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio
from app.config import settings
from app.routers import nfts, transactions
from app.indexer import start_indexer


# 后台任务
indexer_task = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动时
    global indexer_task
    print("🚀 Starting NFT Marketplace API...")
    
    # 启动索引器（后台任务）
    indexer_task = asyncio.create_task(start_indexer())
    print("✅ Indexer started in background")
    
    yield
    
    # 关闭时
    print("👋 Shutting down...")
    if indexer_task:
        indexer_task.cancel()


# 创建FastAPI应用
app = FastAPI(
    title="NFT Marketplace API",
    description="Backend API for NFT Marketplace",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(nfts.router, prefix="/api")
app.include_router(transactions.router, prefix="/api")


@app.get("/")
async def root():
    return {
        "message": "NFT Marketplace API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
