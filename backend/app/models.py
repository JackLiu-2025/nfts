from sqlalchemy import Column, Integer, String, Numeric, Boolean, DateTime, Text, Index
from sqlalchemy.sql import func
from app.database import Base


class NFT(Base):
    __tablename__ = "nfts"
    
    id = Column(Integer, primary_key=True, index=True)
    token_id = Column(Integer, unique=True, nullable=False, index=True)
    token_uri = Column(Text, nullable=False)
    name = Column(String(200))
    description = Column(Text)
    image_url = Column(Text)
    
    # 创作者和拥有者
    creator = Column(String(42), nullable=False, index=True)
    owner = Column(String(42), nullable=False, index=True)
    
    # NFT属性
    category = Column(String(50), index=True)
    royalty_percent = Column(Integer, default=0)  # 存储为基点 (500 = 5%)
    
    # 挂单信息
    is_listed = Column(Boolean, default=False, index=True)
    price = Column(Numeric(precision=78, scale=0), nullable=True)  # Wei
    seller = Column(String(42), nullable=True)
    
    # 状态
    is_burned = Column(Boolean, default=False, index=True)
    
    # 时间戳
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # 索引
    __table_args__ = (
        Index('idx_owner_listed', 'owner', 'is_listed'),
        Index('idx_creator_burned', 'creator', 'is_burned'),
        Index('idx_category_listed', 'category', 'is_listed'),
    )


class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    tx_hash = Column(String(66), unique=True, nullable=False, index=True)
    block_number = Column(Integer, nullable=False, index=True)
    
    # 交易类型: mint, list, buy, cancel, burn
    tx_type = Column(String(20), nullable=False, index=True)
    
    # NFT信息
    token_id = Column(Integer, nullable=False, index=True)
    
    # 参与者
    from_address = Column(String(42), index=True)
    to_address = Column(String(42), index=True)
    
    # 价格（如果适用）
    price = Column(Numeric(precision=78, scale=0), nullable=True)
    
    # 时间戳
    timestamp = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # 索引
    __table_args__ = (
        Index('idx_token_type', 'token_id', 'tx_type'),
        Index('idx_from_type', 'from_address', 'tx_type'),
    )


class IndexerState(Base):
    __tablename__ = "indexer_state"
    
    id = Column(Integer, primary_key=True)
    last_indexed_block = Column(Integer, nullable=False, default=0)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
