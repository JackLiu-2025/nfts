import asyncio
import asyncpg
from datetime import datetime

async def check_database():
    """检查数据库中的数据"""
    conn = await asyncpg.connect(
        host='64.176.82.230',
        port=5432,
        user='agt_user',
        password='Agt2025?',
        database='nt'
    )
    
    try:
        # 检查 NFTs 表
        nft_count = await conn.fetchval('SELECT COUNT(*) FROM nfts')
        print(f"📊 NFTs 表记录数: {nft_count}")
        
        if nft_count > 0:
            nfts = await conn.fetch('SELECT token_id, name, creator, owner FROM nfts LIMIT 5')
            print("\n前5个NFT:")
            for nft in nfts:
                print(f"  - Token ID: {nft['token_id']}, Name: {nft['name']}, Creator: {nft['creator']}")
        
        # 检查 Transactions 表
        tx_count = await conn.fetchval('SELECT COUNT(*) FROM transactions')
        print(f"\n📊 Transactions 表记录数: {tx_count}")
        
        if tx_count > 0:
            txs = await conn.fetch('SELECT tx_type, token_id, block_number FROM transactions ORDER BY block_number DESC LIMIT 5')
            print("\n最近5笔交易:")
            for tx in txs:
                print(f"  - Type: {tx['tx_type']}, Token ID: {tx['token_id']}, Block: {tx['block_number']}")
        
        # 检查 Indexer State
        state = await conn.fetchrow('SELECT * FROM indexer_state WHERE id = 1')
        if state:
            print(f"\n📊 索引器状态:")
            print(f"  - 最后索引区块: {state['last_indexed_block']}")
            print(f"  - 更新时间: {state['updated_at']}")
        
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(check_database())
