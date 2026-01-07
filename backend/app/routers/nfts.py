from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.database import get_db
from app import crud, schemas

router = APIRouter(prefix="/nfts", tags=["NFTs"])


@router.get("", response_model=schemas.NFTListResponse)
async def list_nfts(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    category: Optional[str] = None,
    is_listed: Optional[bool] = None,
    owner: Optional[str] = None,
    creator: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: str = Query("created_at", regex="^(created_at|price|token_id)$"),
    sort_order: str = Query("desc", regex="^(asc|desc)$"),
    db: AsyncSession = Depends(get_db),
):
    """获取NFT列表"""
    nfts, total = await crud.get_nfts(
        db=db,
        skip=skip,
        limit=limit,
        category=category,
        is_listed=is_listed,
        owner=owner,
        creator=creator,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order,
    )
    
    # 转换price为字符串
    nft_responses = []
    for nft in nfts:
        nft_dict = {
            "id": nft.id,
            "token_id": nft.token_id,
            "token_uri": nft.token_uri,
            "name": nft.name,
            "description": nft.description,
            "image_url": nft.image_url,
            "creator": nft.creator,
            "owner": nft.owner,
            "category": nft.category,
            "royalty_percent": nft.royalty_percent,
            "is_listed": nft.is_listed,
            "price": str(nft.price) if nft.price else None,
            "seller": nft.seller,
            "is_burned": nft.is_burned,
            "created_at": nft.created_at,
            "updated_at": nft.updated_at,
        }
        nft_responses.append(schemas.NFTResponse(**nft_dict))
    
    return schemas.NFTListResponse(total=total, items=nft_responses)


@router.get("/{token_id}", response_model=schemas.NFTResponse)
async def get_nft(
    token_id: int,
    db: AsyncSession = Depends(get_db),
):
    """获取单个NFT详情"""
    nft = await crud.get_nft_by_token_id(db, token_id)
    
    if not nft:
        raise HTTPException(status_code=404, detail="NFT not found")
    
    nft_dict = {
        "id": nft.id,
        "token_id": nft.token_id,
        "token_uri": nft.token_uri,
        "name": nft.name,
        "description": nft.description,
        "image_url": nft.image_url,
        "creator": nft.creator,
        "owner": nft.owner,
        "category": nft.category,
        "royalty_percent": nft.royalty_percent,
        "is_listed": nft.is_listed,
        "price": str(nft.price) if nft.price else None,
        "seller": nft.seller,
        "is_burned": nft.is_burned,
        "created_at": nft.created_at,
        "updated_at": nft.updated_at,
    }
    
    return schemas.NFTResponse(**nft_dict)


@router.get("/stats/summary", response_model=schemas.StatsResponse)
async def get_stats(
    db: AsyncSession = Depends(get_db),
):
    """获取市场统计数据"""
    stats = await crud.get_stats(db)
    return schemas.StatsResponse(**stats)
