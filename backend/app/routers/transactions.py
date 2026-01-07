from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.database import get_db
from app import crud, schemas

router = APIRouter(prefix="/transactions", tags=["Transactions"])


@router.get("", response_model=schemas.TransactionListResponse)
async def list_transactions(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    token_id: Optional[int] = None,
    tx_type: Optional[str] = None,
    address: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """获取交易列表"""
    transactions, total = await crud.get_transactions(
        db=db,
        skip=skip,
        limit=limit,
        token_id=token_id,
        tx_type=tx_type,
        address=address,
    )
    
    # 转换price为字符串
    tx_responses = []
    for tx in transactions:
        tx_dict = {
            "id": tx.id,
            "tx_hash": tx.tx_hash,
            "block_number": tx.block_number,
            "tx_type": tx.tx_type,
            "token_id": tx.token_id,
            "from_address": tx.from_address,
            "to_address": tx.to_address,
            "price": str(tx.price) if tx.price else None,
            "timestamp": tx.timestamp,
            "created_at": tx.created_at,
        }
        tx_responses.append(schemas.TransactionResponse(**tx_dict))
    
    return schemas.TransactionListResponse(total=total, items=tx_responses)
