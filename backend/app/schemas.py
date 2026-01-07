from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from decimal import Decimal


class NFTBase(BaseModel):
    token_id: int
    name: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    category: Optional[str] = None


class NFTCreate(NFTBase):
    token_uri: str
    creator: str
    owner: str
    royalty_percent: int = 0


class NFTUpdate(BaseModel):
    owner: Optional[str] = None
    is_listed: Optional[bool] = None
    price: Optional[str] = None  # Wei as string
    seller: Optional[str] = None
    is_burned: Optional[bool] = None


class NFTResponse(NFTBase):
    id: int
    token_uri: str
    creator: str
    owner: str
    royalty_percent: int
    is_listed: bool
    price: Optional[str] = None  # Wei as string
    seller: Optional[str] = None
    is_burned: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class TransactionBase(BaseModel):
    tx_hash: str
    block_number: int
    tx_type: str
    token_id: int
    timestamp: datetime


class TransactionCreate(TransactionBase):
    from_address: Optional[str] = None
    to_address: Optional[str] = None
    price: Optional[str] = None  # Wei as string


class TransactionResponse(TransactionBase):
    id: int
    from_address: Optional[str] = None
    to_address: Optional[str] = None
    price: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class NFTListResponse(BaseModel):
    total: int
    items: list[NFTResponse]


class TransactionListResponse(BaseModel):
    total: int
    items: list[TransactionResponse]


class StatsResponse(BaseModel):
    total_nfts: int
    total_listed: int
    total_sold: int
    total_volume: str  # Wei as string
    floor_price: Optional[str] = None  # Wei as string
