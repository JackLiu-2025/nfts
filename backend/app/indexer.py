import asyncio
import json
from web3 import Web3
from web3.middleware import geth_poa_middleware
from web3.contract import Contract
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import AsyncSessionLocal
from app.config import settings
from app import crud, schemas
from app.models import NFT
import httpx


# 加载合约ABI（现在是纯数组格式）
with open("../frontend/src/contracts/NFTMarketplace.json", "r") as f:
    CONTRACT_ABI = json.load(f)


class BlockchainIndexer:
    def __init__(self):
        self.w3 = Web3(Web3.HTTPProvider(settings.RPC_URL))
        # 添加POA中间件以支持Polygon
        self.w3.middleware_onion.inject(geth_poa_middleware, layer=0)
        self.contract: Contract = self.w3.eth.contract(
            address=Web3.to_checksum_address(settings.CONTRACT_ADDRESS),
            abi=CONTRACT_ABI
        )
        self.ipfs_gateway = settings.IPFS_GATEWAY
    
    async def fetch_metadata(self, token_uri: str) -> dict:
        """从IPFS获取NFT元数据"""
        try:
            # 转换IPFS URL
            if token_uri.startswith("ipfs://"):
                http_url = token_uri.replace("ipfs://", self.ipfs_gateway)
            else:
                http_url = token_uri
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(http_url)
                response.raise_for_status()
                return response.json()
        except Exception as e:
            print(f"Error fetching metadata from {token_uri}: {e}")
            return {}
    
    async def process_nft_minted_event(self, event, db: AsyncSession):
        """处理NFT铸造事件"""
        token_id = event['args']['tokenId']
        creator = event['args']['creator'].lower()
        token_uri = event['args']['tokenURI']
        royalty_percent = event['args']['royaltyPercent']
        category = event['args']['category']
        
        # 检查NFT是否已存在
        existing_nft = await crud.get_nft_by_token_id(db, token_id)
        if existing_nft:
            print(f"NFT {token_id} already exists, skipping...")
            return
        
        # 获取元数据
        metadata = await self.fetch_metadata(token_uri)
        name = metadata.get('name', f'NFT #{token_id}')
        description = metadata.get('description', '')
        image_url = metadata.get('image', '')
        
        # 转换IPFS URL
        if image_url.startswith("ipfs://"):
            image_url = image_url.replace("ipfs://", self.ipfs_gateway)
        
        # 创建NFT记录
        nft_create = schemas.NFTCreate(
            token_id=token_id,
            token_uri=token_uri,
            name=name,
            description=description,
            image_url=image_url,
            creator=creator,
            owner=creator,
            category=category,
            royalty_percent=royalty_percent,
        )
        
        await crud.create_nft(db, nft_create)
        
        # 创建交易记录
        tx_create = schemas.TransactionCreate(
            tx_hash=event['transactionHash'].hex(),
            block_number=event['blockNumber'],
            tx_type='mint',
            token_id=token_id,
            from_address=None,
            to_address=creator,
            price=None,
            timestamp=datetime.fromtimestamp(
                self.w3.eth.get_block(event['blockNumber'])['timestamp']
            ),
        )
        
        await crud.create_transaction(db, tx_create)
        print(f"✅ Indexed NFT Minted: Token ID {token_id}")
    
    async def process_nft_listed_event(self, event, db: AsyncSession):
        """处理NFT挂单事件"""
        token_id = event['args']['tokenId']
        seller = event['args']['seller'].lower()
        price = str(event['args']['price'])
        
        # 更新NFT状态
        nft_update = schemas.NFTUpdate(
            is_listed=True,
            price=price,
            seller=seller,
        )
        
        await crud.update_nft(db, token_id, nft_update)
        
        # 创建交易记录
        tx_create = schemas.TransactionCreate(
            tx_hash=event['transactionHash'].hex(),
            block_number=event['blockNumber'],
            tx_type='list',
            token_id=token_id,
            from_address=seller,
            to_address=None,
            price=price,
            timestamp=datetime.fromtimestamp(
                self.w3.eth.get_block(event['blockNumber'])['timestamp']
            ),
        )
        
        await crud.create_transaction(db, tx_create)
        print(f"✅ Indexed NFT Listed: Token ID {token_id}, Price {price}")
    
    async def process_nft_sold_event(self, event, db: AsyncSession):
        """处理NFT售出事件"""
        token_id = event['args']['tokenId']
        seller = event['args']['seller'].lower()
        buyer = event['args']['buyer'].lower()
        price = str(event['args']['price'])
        
        # 更新NFT状态
        nft_update = schemas.NFTUpdate(
            owner=buyer,
            is_listed=False,
            price=None,
            seller=None,
        )
        
        await crud.update_nft(db, token_id, nft_update)
        
        # 创建交易记录
        tx_create = schemas.TransactionCreate(
            tx_hash=event['transactionHash'].hex(),
            block_number=event['blockNumber'],
            tx_type='buy',
            token_id=token_id,
            from_address=buyer,
            to_address=seller,
            price=price,
            timestamp=datetime.fromtimestamp(
                self.w3.eth.get_block(event['blockNumber'])['timestamp']
            ),
        )
        
        await crud.create_transaction(db, tx_create)
        print(f"✅ Indexed NFT Sold: Token ID {token_id}, Buyer {buyer}")
    
    async def process_listing_cancelled_event(self, event, db: AsyncSession):
        """处理取消挂单事件"""
        token_id = event['args']['tokenId']
        seller = event['args']['seller'].lower()
        
        # 更新NFT状态
        nft_update = schemas.NFTUpdate(
            is_listed=False,
            price=None,
            seller=None,
        )
        
        await crud.update_nft(db, token_id, nft_update)
        
        # 创建交易记录
        tx_create = schemas.TransactionCreate(
            tx_hash=event['transactionHash'].hex(),
            block_number=event['blockNumber'],
            tx_type='cancel',
            token_id=token_id,
            from_address=seller,
            to_address=None,
            price=None,
            timestamp=datetime.fromtimestamp(
                self.w3.eth.get_block(event['blockNumber'])['timestamp']
            ),
        )
        
        await crud.create_transaction(db, tx_create)
        print(f"✅ Indexed Listing Cancelled: Token ID {token_id}")
    
    async def process_nft_burned_event(self, event, db: AsyncSession):
        """处理NFT销毁事件"""
        token_id = event['args']['tokenId']
        burner = event['args']['burner'].lower()
        
        # 更新NFT状态
        nft_update = schemas.NFTUpdate(
            is_burned=True,
            is_listed=False,
            price=None,
            seller=None,
        )
        
        await crud.update_nft(db, token_id, nft_update)
        
        # 创建交易记录
        tx_create = schemas.TransactionCreate(
            tx_hash=event['transactionHash'].hex(),
            block_number=event['blockNumber'],
            tx_type='burn',
            token_id=token_id,
            from_address=burner,
            to_address=None,
            price=None,
            timestamp=datetime.fromtimestamp(
                self.w3.eth.get_block(event['blockNumber'])['timestamp']
            ),
        )
        
        await crud.create_transaction(db, tx_create)
        print(f"✅ Indexed NFT Burned: Token ID {token_id}")
    
    async def index_events(self, from_block: int, to_block: int):
        """索引指定区块范围的事件"""
        async with AsyncSessionLocal() as db:
            # 使用getLogs代替create_filter，更兼容公共RPC
            # NFTMinted事件
            minted_events = self.contract.events.NFTMinted.get_logs(
                fromBlock=from_block,
                toBlock=to_block
            )
            for event in minted_events:
                await self.process_nft_minted_event(event, db)
            
            # NFTListed事件
            listed_events = self.contract.events.NFTListed.get_logs(
                fromBlock=from_block,
                toBlock=to_block
            )
            for event in listed_events:
                await self.process_nft_listed_event(event, db)
            
            # NFTSold事件
            sold_events = self.contract.events.NFTSold.get_logs(
                fromBlock=from_block,
                toBlock=to_block
            )
            for event in sold_events:
                await self.process_nft_sold_event(event, db)
            
            # ListingCancelled事件
            cancelled_events = self.contract.events.ListingCancelled.get_logs(
                fromBlock=from_block,
                toBlock=to_block
            )
            for event in cancelled_events:
                await self.process_listing_cancelled_event(event, db)
            
            # NFTBurned事件
            burned_events = self.contract.events.NFTBurned.get_logs(
                fromBlock=from_block,
                toBlock=to_block
            )
            for event in burned_events:
                await self.process_nft_burned_event(event, db)
            
            # 更新索引器状态
            await crud.update_indexer_state(db, to_block)
    
    async def run(self):
        """运行索引器"""
        print("🚀 Starting blockchain indexer...")
        
        # 每次最多索引的区块数（减小以适应公共RPC限制）
        MAX_BLOCK_RANGE = 50
        
        while True:
            try:
                # 让出控制权，避免阻塞事件循环
                await asyncio.sleep(0)
                
                async with AsyncSessionLocal() as db:
                    # 获取上次索引的区块
                    state = await crud.get_indexer_state(db)
                    last_block = state.last_indexed_block if state else settings.INDEXER_START_BLOCK
                    
                    # 获取最新区块
                    latest_block = self.w3.eth.block_number
                    
                    if last_block < latest_block:
                        # 限制每次索引的区块范围
                        to_block = min(last_block + MAX_BLOCK_RANGE, latest_block)
                        
                        print(f"📊 Indexing blocks {last_block + 1} to {to_block}...")
                        await self.index_events(last_block + 1, to_block)
                        print(f"✅ Indexed up to block {to_block}")
                        
                        # 索引完一批后立即让出控制权
                        await asyncio.sleep(0.1)
                    else:
                        print(f"⏳ Waiting for new blocks... (current: {latest_block})")
                
                # 等待一段时间再检查（增加到30秒，减少RPC调用频率）
                await asyncio.sleep(30)
                
            except Exception as e:
                print(f"❌ Indexer error: {e}")
                import traceback
                traceback.print_exc()
                await asyncio.sleep(30)


async def start_indexer():
    """启动索引器"""
    indexer = BlockchainIndexer()
    await indexer.run()
