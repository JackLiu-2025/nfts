#!/usr/bin/env python3
"""Update indexer state to start from current block"""

import asyncio
from app.database import AsyncSessionLocal
from app.models import IndexerState
from sqlalchemy import select

async def update_indexer_state():
    async with AsyncSessionLocal() as db:
        # Get current state
        result = await db.execute(select(IndexerState).where(IndexerState.id == 1))
        state = result.scalar_one_or_none()
        
        if state:
            state.last_indexed_block = 31830000
            await db.commit()
            print(f"✅ Updated indexer state to block 31830000")
        else:
            print("❌ Indexer state not found")

if __name__ == "__main__":
    asyncio.run(update_indexer_state())
