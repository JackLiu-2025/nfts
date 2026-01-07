# Requirements Document

## Introduction

本文档定义了一个基于Polygon区块链的NFT交易平台的功能需求。该平台支持NFT的铸造、交易、销毁等核心功能，并提供多语言支持（中文、日文、英文）。平台采用简约设计理念，专注于核心功能的实现，为用户提供安全、高效的NFT交易体验。

## Glossary

- **System**: NFT交易平台系统
- **User**: 使用平台的终端用户
- **Wallet**: Web3钱包（如MetaMask）
- **NFT**: 非同质化代币（Non-Fungible Token）
- **Minting**: NFT铸造过程
- **Burning**: NFT销毁过程
- **Marketplace**: NFT交易市场
- **IPFS**: 星际文件系统，用于存储NFT媒体文件
- **Pinata**: IPFS托管服务提供商
- **Polygon**: 以太坊Layer 2扩展解决方案
- **MATIC**: Polygon网络的原生代币
- **Smart_Contract**: 部署在区块链上的智能合约
- **Metadata**: NFT的元数据（名称、描述、属性等）
- **Gas_Fee**: 区块链交易手续费
- **Royalty**: NFT创作者版税
- **Listing**: NFT挂单出售
- **Transaction_Feed**: 实时交易动态展示

## Requirements

### Requirement 1: 用户钱包连接与身份验证

**User Story:** 作为用户，我想连接我的Web3钱包，以便在平台上进行NFT相关操作。

#### Acceptance Criteria

1. WHEN User访问平台时，THE System SHALL显示钱包连接按钮
2. WHEN User点击连接钱包按钮，THE System SHALL请求Wallet授权连接
3. WHEN Wallet授权成功，THE System SHALL获取User的钱包地址并验证签名
4. WHEN User已连接Wallet，THE System SHALL在界面显示钱包地址（脱敏格式：0x1234...5678）
5. WHEN User断开Wallet连接，THE System SHALL清除会话状态并返回未连接状态
6. IF Wallet签名验证失败，THEN THE System SHALL拒绝连接并显示错误消息

### Requirement 2: NFT铸造功能

**User Story:** 作为创作者，我想铸造NFT，以便将我的数字作品上链并进行交易。

#### Acceptance Criteria

1. WHEN User上传图片文件，THE System SHALL验证文件类型为jpg、jpeg、png、gif或webp
2. WHEN User上传图片文件，THE System SHALL验证文件大小不超过10MB
3. WHEN User上传图片文件，THE System SHALL验证文件MIME类型和文件头匹配声明的扩展名
4. IF 文件验证失败，THEN THE System SHALL拒绝上传并显示具体错误原因
5. WHEN 文件验证通过，THE System SHALL将图片上传到Pinata IPFS服务
6. WHEN IPFS上传成功，THE System SHALL返回IPFS哈希值
7. WHEN User填写NFT元数据，THE System SHALL验证名称长度为1-100字符
8. WHEN User填写NFT元数据，THE System SHALL验证描述长度不超过1000字符
9. WHEN User设置版税比例，THE System SHALL验证版税范围为0-10%
10. WHEN User提交铸造请求，THE System SHALL调用Smart_Contract执行铸造操作
11. WHEN 铸造交易确认，THE System SHALL将NFT信息存储到数据库
12. WHEN 铸造成功，THE System SHALL显示成功消息并跳转到NFT详情页
13. WHEN User每小时铸造NFT超过5个，THE System SHALL拒绝请求并提示速率限制

### Requirement 3: NFT销毁功能

**User Story:** 作为NFT持有者，我想销毁我拥有的NFT，以便管理我的数字资产。

#### Acceptance Criteria

1. WHEN User请求销毁NFT，THE System SHALL验证User是NFT的当前持有者
2. IF User不是NFT持有者，THEN THE System SHALL拒绝操作并显示错误消息
3. WHEN User确认销毁操作，THE System SHALL显示二次确认对话框
4. WHERE NFT是User创作的，THE System SHALL显示警告："销毁后无法恢复"
5. WHERE NFT是User购买的，THE System SHALL显示警告："这是你购买的NFT，销毁后无法恢复且无法退款"
6. WHEN User最终确认销毁，THE System SHALL调用Smart_Contract执行销毁操作
7. WHEN 销毁交易确认，THE System SHALL更新数据库中NFT状态为已销毁
8. WHEN 销毁成功，THE System SHALL显示成功消息并从用户持有列表中移除该NFT

### Requirement 4: NFT交易市场

**User Story:** 作为用户，我想在市场上买卖NFT，以便进行数字资产交易。

#### Acceptance Criteria

1. WHEN User挂单出售NFT，THE System SHALL验证User是NFT的当前持有者
2. WHEN User设置出售价格，THE System SHALL验证价格大于0.001 MATIC
3. WHEN User设置出售价格，THE System SHALL验证价格不超过1000000 MATIC
4. WHEN User提交挂单，THE System SHALL调用Smart_Contract创建挂单
5. WHEN 挂单创建成功，THE System SHALL将挂单信息存储到数据库
6. WHEN User取消挂单，THE System SHALL验证User是卖家
7. WHEN User取消挂单，THE System SHALL调用Smart_Contract取消挂单并更新数据库
8. WHEN User购买NFT，THE System SHALL验证NFT当前处于出售状态
9. WHEN User购买NFT，THE System SHALL验证User钱包余额足够支付价格和Gas_Fee
10. WHEN User确认购买，THE System SHALL调用Smart_Contract执行交易
11. WHEN 交易确认，THE System SHALL更新数据库中NFT所有权和挂单状态
12. WHEN 交易成功，THE System SHALL记录交易历史到数据库
13. IF NFT已被其他User购买，THEN THE System SHALL拒绝交易并显示"NFT已售出"

### Requirement 5: 个人中心

**User Story:** 作为用户，我想查看和管理我的NFT资产，以便了解我的数字资产状况。

#### Acceptance Criteria

1. WHEN User访问个人中心，THE System SHALL显示三个分类标签：我创作的、我收藏的、出售中
2. WHEN User查看"我创作的"标签，THE System SHALL显示User铸造的所有NFT
3. WHEN User查看"我创作的"标签，THE System SHALL区分显示持有中和已售出的NFT
4. WHERE NFT在"我创作的"且持有中，THE System SHALL提供出售、销毁、转赠操作
5. WHERE NFT在"我创作的"且已售出，THE System SHALL仅提供查看功能并显示"已售出"标识
6. WHEN User查看"我收藏的"标签，THE System SHALL显示User购买或接收的NFT
7. WHERE NFT在"我收藏的"，THE System SHALL提供出售、销毁、转赠操作
8. WHEN User查看"出售中"标签，THE System SHALL显示User当前挂单的所有NFT
9. WHERE NFT在"出售中"，THE System SHALL提供取消挂单和修改价格操作
10. WHEN User修改出售价格，THE System SHALL验证新价格符合价格范围要求

### Requirement 6: NFT浏览与搜索

**User Story:** 作为用户，我想浏览和搜索NFT，以便发现感兴趣的数字作品。

#### Acceptance Criteria

1. WHEN User访问市场页面，THE System SHALL显示所有在售NFT列表
2. WHEN System显示NFT列表，THE System SHALL使用分页方式每页显示最多50条记录
3. WHEN User输入搜索关键词，THE System SHALL在NFT名称、描述和创作者地址中搜索
4. WHEN User执行搜索，THE System SHALL返回最多1000条匹配结果
5. WHEN User每分钟搜索超过20次，THE System SHALL拒绝请求并提示速率限制
6. WHEN User选择分类筛选，THE System SHALL仅显示该分类下的NFT
7. WHEN User设置价格范围筛选，THE System SHALL仅显示价格在范围内的NFT
8. WHEN User点击NFT，THE System SHALL跳转到NFT详情页

### Requirement 7: NFT详情页

**User Story:** 作为用户，我想查看NFT的详细信息，以便了解NFT的完整情况。

#### Acceptance Criteria

1. WHEN User访问NFT详情页，THE System SHALL显示NFT图片
2. WHEN User访问NFT详情页，THE System SHALL显示NFT名称、描述和属性
3. WHEN User访问NFT详情页，THE System SHALL显示当前所有者钱包地址（脱敏格式）
4. WHEN User访问NFT详情页，THE System SHALL显示创作者钱包地址（脱敏格式）
5. WHEN User访问NFT详情页，THE System SHALL显示版税比例
6. WHERE NFT在售，THE System SHALL显示当前价格和购买按钮
7. WHEN User访问NFT详情页，THE System SHALL显示该NFT的交易历史记录
8. WHEN System显示交易历史，THE System SHALL包含交易时间、买家、卖家和价格信息

### Requirement 8: 实时交易动态

**User Story:** 作为用户，我想看到平台的实时交易动态，以便了解市场活跃度。

#### Acceptance Criteria

1. WHEN User访问首页，THE System SHALL显示Transaction_Feed组件
2. WHEN System显示Transaction_Feed，THE System SHALL展示最近10-20条交易记录
3. WHEN 发生新交易，THE System SHALL在Transaction_Feed中添加新记录
4. WHEN System显示交易记录，THE System SHALL包含买家地址（脱敏）、NFT名称和交易时间
5. WHEN System显示交易时间，THE System SHALL使用相对时间格式（如"2分钟前"）
6. WHEN Transaction_Feed更新，THE System SHALL每30秒自动刷新一次

### Requirement 9: 多语言支持

**User Story:** 作为国际用户，我想切换界面语言，以便使用我熟悉的语言浏览平台。

#### Acceptance Criteria

1. THE System SHALL支持中文、日文、英文三种语言
2. WHEN User首次访问，THE System SHALL根据浏览器语言设置默认语言
3. WHEN User选择语言，THE System SHALL立即切换界面所有文本为选定语言
4. WHEN User选择语言，THE System SHALL将语言偏好保存到本地存储
5. WHEN User再次访问，THE System SHALL使用上次选择的语言
6. WHEN System显示错误消息，THE System SHALL使用当前选定语言

### Requirement 10: 安全性与验证

**User Story:** 作为平台管理者，我想确保系统安全，以便保护用户资产和数据。

#### Acceptance Criteria

1. WHEN System接收文件上传，THE System SHALL验证文件扩展名在白名单内
2. WHEN System接收文件上传，THE System SHALL验证文件MIME类型与扩展名一致
3. WHEN System接收文件上传，THE System SHALL验证文件头魔数与声明类型匹配
4. WHEN System接收API请求，THE System SHALL验证请求速率不超过每分钟100次
5. WHEN System接收用户输入，THE System SHALL清理和转义HTML特殊字符防止XSS攻击
6. WHEN System执行数据库查询，THE System SHALL使用参数化查询防止SQL注入
7. WHEN System调用Smart_Contract，THE System SHALL验证交易参数的有效性
8. WHEN System处理交易，THE System SHALL验证User钱包签名的真实性
9. WHEN System返回错误，THE System SHALL记录详细日志到服务器但仅返回友好消息给前端
10. WHEN System上传文件到IPFS，THE System SHALL实现重试机制最多3次

### Requirement 11: 数据库管理

**User Story:** 作为开发者，我想使用版本化的数据库迁移工具，以便管理数据库schema变更。

#### Acceptance Criteria

1. THE System SHALL使用Flyway管理数据库迁移
2. WHEN System启动，THE System SHALL自动执行待执行的数据库迁移脚本
3. WHEN 迁移脚本执行失败，THE System SHALL回滚变更并记录错误日志
4. THE System SHALL将迁移历史记录存储在数据库中
5. WHEN 开发者创建新迁移脚本，THE System SHALL按版本号顺序执行

### Requirement 12: 智能合约集成

**User Story:** 作为系统架构师，我想集成标准的NFT智能合约，以便确保合约安全性和兼容性。

#### Acceptance Criteria

1. THE Smart_Contract SHALL遵循ERC-721标准
2. THE Smart_Contract SHALL部署在Polygon Amoy Testnet用于测试
3. THE Smart_Contract SHALL部署在Polygon Mainnet用于生产环境
4. WHEN System调用Smart_Contract，THE System SHALL使用web3.py库
5. WHEN Smart_Contract交易失败，THE System SHALL捕获错误并返回友好消息
6. THE Smart_Contract SHALL支持版税功能
7. THE Smart_Contract SHALL支持NFT销毁功能
8. THE Smart_Contract SHALL防止重入攻击
