from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, desc
from sqlalchemy.sql import Select
from typing import Optional, List
from app.models import NFT, Transaction, IndexerState
from app.schemas import NFTCreate, NFTUpdate, TransactionCreate
from decimal import Decimal


# NFT CRUD操作
async def create_nft(db: AsyncSession, nft: NFTCreate) -> NFT:
    db_nft = NFT(**nft.model_dump())
    db.add(db_nft)
    await db.commit()
    await db.refresh(db_nft)
    return db_nft


async def get_nft_by_token_id(db: AsyncSession, token_id: int) -> Optional[NFT]:
    result = await db.execute(
        select(NFT).where(NFT.token_id == token_id)
    )
    return result.scalar_one_or_none()


async def update_nft(db: AsyncSession, token_id: int, nft_update: NFTUpdate) -> Optional[NFT]:
    result = await db.execute(
        select(NFT).where(NFT.token_id == token_id)
    )
    db_nft = result.scalar_one_or_none()
    
    if db_nft:
        update_data = nft_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_nft, key, value)
        
        await db.commit()
        await db.refresh(db_nft)
    
    return db_nft


async def get_nfts(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    is_listed: Optional[bool] = None,
    owner: Optional[str] = None,
    creator: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: str = "created_at",
    sort_order: str = "desc",
) -> tuple[List[NFT], int]:
    # 构建查询
    query = select(NFT).where(NFT.is_burned == False)
    
    # 筛选条件
    if category:
        query = query.where(NFT.category == category)
    
    if is_listed is not None:
        query = query.where(NFT.is_listed == is_listed)
    
    if owner:
        query = query.where(NFT.owner == owner.lower())
    
    if creator:
        query = query.where(NFT.creator == creator.lower())
    
    if search:
        search_pattern = f"%{search}%"
        query = query.where(
            or_(
                NFT.name.ilike(search_pattern),
                NFT.description.ilike(search_pattern)
            )
        )
    
    # 计算总数
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # 排序
    if sort_by == "price":
        if sort_order == "asc":
            query = query.order_by(NFT.price.asc().nulls_last())
        else:
            query = query.order_by(NFT.price.desc().nulls_last())
    elif sort_by == "token_id":
        if sort_order == "asc":
            query = query.order_by(NFT.token_id.asc())
        else:
            query = query.order_by(NFT.token_id.desc())
    else:  # created_at
        if sort_order == "asc":
            query = query.order_by(NFT.created_at.asc())
        else:
            query = query.order_by(NFT.created_at.desc())
    
    # 分页
    query = query.offset(skip).limit(limit)
    
    result = await db.execute(query)
    nfts = result.scalars().all()
    
    return list(nfts), total


# Transaction CRUD操作
async def create_transaction(db: AsyncSession, transaction: TransactionCreate) -> Transaction:
    db_tx = Transaction(**transaction.model_dump())
    db.add(db_tx)
    await db.commit()
    await db.refresh(db_tx)
    return db_tx


async def get_transaction_by_hash(db: AsyncSession, tx_hash: str) -> Optional[Transaction]:
    result = await db.execute(
        select(Transaction).where(Transaction.tx_hash == tx_hash)
    )
    return result.scalar_one_or_none()


async def get_transactions(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 100,
    token_id: Optional[int] = None,
    tx_type: Optional[str] = None,
    address: Optional[str] = None,
) -> tuple[List[Transaction], int]:
    query = select(Transaction)
    
    # 筛选条件
    if token_id is not None:
        query = query.where(Transaction.token_id == token_id)
    
    if tx_type:
        query = query.where(Transaction.tx_type == tx_type)
    
    if address:
        address_lower = address.lower()
        query = query.where(
            or_(
                Transaction.from_address == address_lower,
                Transaction.to_address == address_lower
            )
        )
    
    # 计算总数
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # 排序和分页
    query = query.order_by(desc(Transaction.timestamp)).offset(skip).limit(limit)
    
    result = await db.execute(query)
    transactions = result.scalars().all()
    
    return list(transactions), total


# 统计数据
async def get_stats(db: AsyncSession) -> dict:
    # 总NFT数量（未销毁）
    total_nfts_result = await db.execute(
        select(func.count(NFT.id)).where(NFT.is_burned == False)
    )
    total_nfts = total_nfts_result.scalar()
    
    # 在售NFT数量
    total_listed_result = await db.execute(
        select(func.count(NFT.id)).where(
            and_(NFT.is_listed == True, NFT.is_burned == False)
        )
    )
    total_listed = total_listed_result.scalar()
    
    # 总销售数量
    total_sold_result = await db.execute(
        select(func.count(Transaction.id)).where(Transaction.tx_type == "buy")
    )
    total_sold = total_sold_result.scalar()
    
    # 总交易量
    total_volume_result = await db.execute(
        select(func.sum(Transaction.price)).where(Transaction.tx_type == "buy")
    )
    total_volume = total_volume_result.scalar() or 0
    
    # 地板价
    floor_price_result = await db.execute(
        select(func.min(NFT.price)).where(
            and_(NFT.is_listed == True, NFT.is_burned == False)
        )
    )
    floor_price = floor_price_result.scalar()
    
    return {
        "total_nfts": total_nfts,
        "total_listed": total_listed,
        "total_sold": total_sold,
        "total_volume": str(total_volume),
        "floor_price": str(floor_price) if floor_price else None,
    }


# Indexer状态
async def get_indexer_state(db: AsyncSession) -> Optional[IndexerState]:
    result = await db.execute(select(IndexerState).where(IndexerState.id == 1))
    return result.scalar_one_or_none()


async def update_indexer_state(db: AsyncSession, last_block: int) -> IndexerState:
    result = await db.execute(select(IndexerState).where(IndexerState.id == 1))
    state = result.scalar_one_or_none()
    
    if state:
        state.last_indexed_block = last_block
    else:
        state = IndexerState(id=1, last_indexed_block=last_block)
        db.add(state)
    
    await db.commit()
    await db.refresh(state)
    return state
