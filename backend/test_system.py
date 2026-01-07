#!/usr/bin/env python3
"""
系统测试脚本 - 验证所有组件是否正常工作
"""
import asyncio
import asyncpg
import httpx
from web3 import Web3
import json

async def test_database():
    """测试数据库连接"""
    print("🔍 测试数据库连接...")
    try:
        conn = await asyncpg.connect(
            host='64.176.82.230',
            port=5432,
            user='agt_user',
            password='Agt2025?',
            database='nt'
        )
        
        # 检查表是否存在
        tables = await conn.fetch("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        """)
        
        table_names = [t['table_name'] for t in tables]
        print(f"  ✅ 数据库连接成功")
        print(f"  ✅ 找到 {len(table_names)} 个表: {', '.join(table_names)}")
        
        # 检查数据
        nft_count = await conn.fetchval('SELECT COUNT(*) FROM nfts')
        tx_count = await conn.fetchval('SELECT COUNT(*) FROM transactions')
        state = await conn.fetchrow('SELECT * FROM indexer_state WHERE id = 1')
        
        print(f"  📊 NFTs: {nft_count} 条记录")
        print(f"  📊 Transactions: {tx_count} 条记录")
        if state:
            print(f"  📊 索引器最后区块: {state['last_indexed_block']}")
        
        await conn.close()
        return True
    except Exception as e:
        print(f"  ❌ 数据库连接失败: {e}")
        return False

async def test_backend_api():
    """测试后端 API"""
    print("\n🔍 测试后端 API...")
    try:
        async with httpx.AsyncClient() as client:
            # 健康检查
            response = await client.get('http://localhost:8000/health')
            if response.status_code == 200:
                print(f"  ✅ 健康检查通过")
            else:
                print(f"  ⚠️  健康检查返回: {response.status_code}")
            
            # NFT 列表
            response = await client.get('http://localhost:8000/api/nfts')
            if response.status_code == 200:
                data = response.json()
                print(f"  ✅ NFT API 正常 (找到 {len(data.get('items', []))} 个 NFT)")
            else:
                print(f"  ⚠️  NFT API 返回: {response.status_code}")
            
            # 统计信息
            response = await client.get('http://localhost:8000/api/nfts/stats/summary')
            if response.status_code == 200:
                stats = response.json()
                print(f"  ✅ 统计 API 正常")
                print(f"     - 总 NFT 数: {stats.get('total_nfts', 0)}")
                print(f"     - 挂单数: {stats.get('listed_nfts', 0)}")
                print(f"     - 总交易量: {stats.get('total_volume', 0)} MATIC")
            else:
                print(f"  ⚠️  统计 API 返回: {response.status_code}")
        
        return True
    except Exception as e:
        print(f"  ❌ 后端 API 测试失败: {e}")
        return False

def test_blockchain():
    """测试区块链连接"""
    print("\n🔍 测试区块链连接...")
    try:
        w3 = Web3(Web3.HTTPProvider('https://rpc-amoy.polygon.technology/'))
        
        # 检查连接
        if w3.is_connected():
            print(f"  ✅ 区块链连接成功")
        else:
            print(f"  ❌ 区块链连接失败")
            return False
        
        # 获取当前区块
        current_block = w3.eth.block_number
        print(f"  📊 当前区块高度: {current_block}")
        
        # 检查合约
        contract_address = '0xB70b8bd1Fe19464b440C352a89A664314b8Fe4B5'
        code = w3.eth.get_code(contract_address)
        if len(code) > 0:
            print(f"  ✅ 合约已部署: {contract_address}")
            print(f"  📊 合约代码大小: {len(code)} bytes")
        else:
            print(f"  ❌ 合约未找到")
            return False
        
        # 加载合约并测试
        with open("../frontend/src/contracts/NFTMarketplace.json", "r") as f:
            contract_data = json.load(f)
            CONTRACT_ABI = contract_data["abi"]
        
        contract = w3.eth.contract(
            address=Web3.to_checksum_address(contract_address),
            abi=CONTRACT_ABI
        )
        
        # 查询最近的事件
        from_block = max(0, current_block - 1000)
        events = contract.events.NFTMinted.get_logs(
            fromBlock=from_block,
            toBlock=current_block
        )
        print(f"  📊 最近 1000 个区块中的 NFTMinted 事件: {len(events)} 个")
        
        return True
    except Exception as e:
        print(f"  ❌ 区块链测试失败: {e}")
        return False

async def test_frontend():
    """测试前端"""
    print("\n🔍 测试前端...")
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get('http://localhost:5174')
            if response.status_code == 200:
                print(f"  ✅ 前端服务正常")
                print(f"  🌐 访问地址: http://localhost:5174")
            else:
                print(f"  ⚠️  前端返回: {response.status_code}")
        return True
    except Exception as e:
        print(f"  ❌ 前端测试失败: {e}")
        print(f"  💡 提示: 确保前端服务正在运行 (npm run dev)")
        return False

async def main():
    """运行所有测试"""
    print("=" * 60)
    print("🚀 NFT Marketplace 系统测试")
    print("=" * 60)
    
    results = []
    
    # 测试数据库
    results.append(await test_database())
    
    # 测试后端 API
    results.append(await test_backend_api())
    
    # 测试区块链
    results.append(test_blockchain())
    
    # 测试前端
    results.append(await test_frontend())
    
    # 总结
    print("\n" + "=" * 60)
    print("📊 测试总结")
    print("=" * 60)
    
    passed = sum(results)
    total = len(results)
    
    if passed == total:
        print(f"✅ 所有测试通过 ({passed}/{total})")
        print("\n🎉 系统运行正常！")
        print("\n📝 下一步:")
        print("  1. 访问 http://localhost:5174")
        print("  2. 连接 MetaMask 钱包（Polygon Amoy 网络）")
        print("  3. 铸造你的第一个 NFT")
        print("  4. 等待 15-30 秒让索引器同步")
        print("  5. 刷新页面查看你的 NFT")
    else:
        print(f"⚠️  部分测试失败 ({passed}/{total})")
        print("\n请检查失败的组件并重试")
    
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(main())
