-- NFT Marketplace Initial Schema

-- NFTs表
CREATE TABLE nfts (
    id SERIAL PRIMARY KEY,
    token_id INTEGER UNIQUE NOT NULL,
    token_uri TEXT NOT NULL,
    name VARCHAR(200),
    description TEXT,
    image_url TEXT,
    
    -- 创作者和拥有者
    creator VARCHAR(42) NOT NULL,
    owner VARCHAR(42) NOT NULL,
    
    -- NFT属性
    category VARCHAR(50),
    royalty_percent INTEGER DEFAULT 0,
    
    -- 挂单信息
    is_listed BOOLEAN DEFAULT FALSE,
    price NUMERIC(78, 0),
    seller VARCHAR(42),
    
    -- 状态
    is_burned BOOLEAN DEFAULT FALSE,
    
    -- 时间戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- NFTs表索引
CREATE INDEX idx_nfts_token_id ON nfts(token_id);
CREATE INDEX idx_nfts_creator ON nfts(creator);
CREATE INDEX idx_nfts_owner ON nfts(owner);
CREATE INDEX idx_nfts_category ON nfts(category);
CREATE INDEX idx_nfts_is_listed ON nfts(is_listed);
CREATE INDEX idx_nfts_is_burned ON nfts(is_burned);
CREATE INDEX idx_nfts_owner_listed ON nfts(owner, is_listed);
CREATE INDEX idx_nfts_creator_burned ON nfts(creator, is_burned);
CREATE INDEX idx_nfts_category_listed ON nfts(category, is_listed);

-- Transactions表
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    tx_hash VARCHAR(66) UNIQUE NOT NULL,
    block_number INTEGER NOT NULL,
    
    -- 交易类型: mint, list, buy, cancel, burn
    tx_type VARCHAR(20) NOT NULL,
    
    -- NFT信息
    token_id INTEGER NOT NULL,
    
    -- 参与者
    from_address VARCHAR(42),
    to_address VARCHAR(42),
    
    -- 价格（如果适用）
    price NUMERIC(78, 0),
    
    -- 时间戳
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Transactions表索引
CREATE INDEX idx_transactions_tx_hash ON transactions(tx_hash);
CREATE INDEX idx_transactions_block_number ON transactions(block_number);
CREATE INDEX idx_transactions_tx_type ON transactions(tx_type);
CREATE INDEX idx_transactions_token_id ON transactions(token_id);
CREATE INDEX idx_transactions_from_address ON transactions(from_address);
CREATE INDEX idx_transactions_to_address ON transactions(to_address);
CREATE INDEX idx_transactions_token_type ON transactions(token_id, tx_type);
CREATE INDEX idx_transactions_from_type ON transactions(from_address, tx_type);
CREATE INDEX idx_transactions_timestamp ON transactions(timestamp DESC);

-- Indexer State表
CREATE TABLE indexer_state (
    id INTEGER PRIMARY KEY DEFAULT 1,
    last_indexed_block INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT single_row CHECK (id = 1)
);

-- 插入初始索引器状态
INSERT INTO indexer_state (id, last_indexed_block) VALUES (1, 0);

-- 创建更新时间戳的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为nfts表添加更新时间戳触发器
CREATE TRIGGER update_nfts_updated_at BEFORE UPDATE ON nfts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 为indexer_state表添加更新时间戳触发器
CREATE TRIGGER update_indexer_state_updated_at BEFORE UPDATE ON indexer_state
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
