import json
from web3 import Web3

# 连接到 Polygon Amoy
w3 = Web3(Web3.HTTPProvider('https://rpc-amoy.polygon.technology/'))

# 合约地址
contract_address = '0xB70b8bd1Fe19464b440C352a89A664314b8Fe4B5'

# 获取合约代码
code = w3.eth.get_code(contract_address)
print(f"合约地址: {contract_address}")
print(f"合约代码长度: {len(code)} bytes")
print(f"合约已部署: {'是' if len(code) > 0 else '否'}")

# 获取当前区块
current_block = w3.eth.block_number
print(f"\n当前区块高度: {current_block}")

# 尝试查找合约部署交易（从最近的区块往回找）
print("\n正在查找合约部署交易...")

# 加载合约 ABI
with open("../frontend/src/contracts/NFTMarketplace.json", "r") as f:
    contract_data = json.load(f)
    CONTRACT_ABI = contract_data["abi"]

contract = w3.eth.contract(
    address=Web3.to_checksum_address(contract_address),
    abi=CONTRACT_ABI
)

# 尝试从最近的几个区块查找事件
print("\n尝试查询最近 1000 个区块的事件...")
from_block = max(0, current_block - 1000)
to_block = current_block

try:
    # 查询 NFTMinted 事件
    events = contract.events.NFTMinted.get_logs(
        fromBlock=from_block,
        toBlock=to_block
    )
    print(f"找到 {len(events)} 个 NFTMinted 事件")
    
    if len(events) > 0:
        first_event = events[0]
        print(f"\n第一个事件:")
        print(f"  - 区块号: {first_event['blockNumber']}")
        print(f"  - Token ID: {first_event['args']['tokenId']}")
        print(f"  - Creator: {first_event['args']['creator']}")
        print(f"\n建议设置 INDEXER_START_BLOCK={first_event['blockNumber'] - 10}")
    else:
        print("\n没有找到任何 NFTMinted 事件")
        print("这意味着还没有人铸造 NFT")
        print(f"\n建议设置 INDEXER_START_BLOCK={current_block - 100}")
        
except Exception as e:
    print(f"查询事件时出错: {e}")
    print(f"\n建议设置 INDEXER_START_BLOCK={current_block - 100}")
