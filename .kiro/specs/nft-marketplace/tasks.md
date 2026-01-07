# Implementation Plan: NFT Marketplace

## Overview

本实现计划将NFT交易平台的开发分为三个主要部分：智能合约、后端API和前端UI。我们将按照从底层到上层的顺序进行开发，确保每个层次都经过充分测试后再进行下一层的开发。所有任务都基于已批准的需求和设计文档。

## Tasks

- [ ] 1. 项目初始化和环境配置
  - 创建项目目录结构（frontend/, backend/, contracts/, docs/）
  - 初始化Git仓库和.gitignore
  - 配置前端项目（React + Vite + TailwindCSS）
  - 配置后端项目（FastAPI + PostgreSQL）
  - 配置智能合约项目（Hardhat）
  - 创建环境变量模板文件
  - _Requirements: 所有需求的基础设施_

- [ ] 2. 智能合约开发
  - [ ] 2.1 实现NFTMarketplace合约
    - 继承ERC721URIStorage、ERC721Royalty、Ownable、ReentrancyGuard
    - 实现mint函数（铸造NFT）
    - 实现burn函数（销毁NFT）
    - 实现createListing函数（创建挂单）
    - 实现cancelListing函数（取消挂单）
    - 实现buyNFT函数（购买NFT）
    - 实现updateListingPrice函数（修改价格）
    - 实现查询函数（getListing, getListedNFTs, getUserNFTs）
    - 定义所有事件（NFTMinted, NFTBurned, NFTListed等）
    - _Requirements: 12.1, 12.6, 12.7, 12.8_

  - [ ]* 2.2 编写合约单元测试
    - 测试mint功能（正常铸造、重复token_id）
    - 测试burn功能（所有者销毁、非所有者销毁）
    - 测试listing功能（创建、取消、修改价格）
    - 测试购买功能（正常购买、余额不足、重复购买）
    - 测试权限控制
    - 测试重入攻击防护
    - _Requirements: 12.8_

  - [ ] 2.3 部署合约到Polygon Amoy测试网
    - 编写部署脚本
    - 配置Hardhat网络参数
    - 部署合约并验证
    - 记录合约地址到环境变量
    - _Requirements: 12.2_

- [ ] 3. 数据库设计和迁移
  - [ ] 3.1 创建Flyway迁移脚本
    - V1__create_users_table.sql
    - V2__create_nfts_table.sql
    - V3__create_listings_table.sql
    - V4__create_transactions_table.sql
    - V5__create_rate_limits_table.sql
    - 添加索引和外键约束
    - _Requirements: 11.1, 11.5_

  - [ ] 3.2 配置Flyway并执行迁移
    - 安装Flyway CLI
    - 配置flyway.conf
    - 执行迁移并验证
    - _Requirements: 11.2, 11.3, 11.4_

- [ ] 4. 后端核心功能实现
  - [ ] 4.1 实现认证模块
    - 创建nonce生成端点（POST /auth/nonce）
    - 创建签名验证端点（POST /auth/verify）
    - 实现钱包签名验证逻辑
    - _Requirements: 1.3, 1.6, 10.8_

  - [ ]* 4.2 编写认证模块属性测试
    - **Property 7: 钱包签名验证**
    - **Validates: Requirements 1.3, 1.6, 10.8**

  - [ ] 4.3 实现文件上传模块
    - 创建文件验证函数（类型、大小、MIME、文件头）
    - 创建Pinata上传函数
    - 实现重试机制（最多3次）
    - 创建上传端点（POST /nfts/upload）
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 10.1, 10.2, 10.3, 10.10_

  - [ ]* 4.4 编写文件上传属性测试
    - **Property 1: 文件上传综合验证**
    - **Property 2: 文件验证失败拒绝**
    - **Property 3: IPFS上传返回哈希**
    - **Property 29: IPFS上传重试机制**
    - **Validates: Requirements 2.1-2.6, 10.1-10.3, 10.10**

  - [ ] 4.5 实现NFT CRUD端点
    - POST /nfts - 创建NFT记录
    - GET /nfts - 获取NFT列表（支持分页、筛选、搜索）
    - GET /nfts/{nft_id} - 获取NFT详情
    - GET /nfts/token/{token_id} - 通过token_id获取NFT
    - 实现元数据验证（名称、描述、版税）
    - _Requirements: 2.7, 2.8, 2.9, 2.11, 6.1, 6.2, 6.3, 6.4, 6.6, 6.7_

  - [ ]* 4.6 编写NFT端点属性测试
    - **Property 4: NFT元数据验证**
    - **Property 10: 铸造后数据持久化**
    - **Property 18: 市场列表筛选**
    - **Property 19: 分页限制**
    - **Property 20: 搜索结果匹配**
    - **Validates: Requirements 2.7-2.9, 2.11, 6.1-6.4, 6.6, 6.7**

  - [ ] 4.6 实现交易市场端点
    - POST /listings - 创建挂单
    - DELETE /listings/{listing_id} - 取消挂单
    - PUT /listings/{listing_id} - 修改价格
    - GET /listings - 获取所有挂单
    - 实现价格验证
    - 实现所有权验证
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 5.10_

  - [ ]* 4.7 编写交易市场属性测试
    - **Property 5: 价格范围验证**
    - **Property 9: NFT所有权验证**
    - **Property 12: 挂单数据一致性**
    - **Property 13: 取消挂单数据同步**
    - **Validates: Requirements 4.1-4.7, 5.10**

  - [ ] 4.8 实现交易记录端点
    - POST /transactions - 记录交易
    - GET /transactions/recent - 获取最近交易
    - GET /transactions/nft/{nft_id} - 获取NFT交易历史
    - 实现交易数据更新逻辑
    - _Requirements: 4.11, 4.12, 7.7, 7.8, 8.2, 8.3_

  - [ ]* 4.9 编写交易记录属性测试
    - **Property 15: 交易后数据更新**
    - **Property 16: 并发购买防护**
    - **Property 22: 交易历史完整性**
    - **Property 23: 实时交易动态展示**
    - **Validates: Requirements 4.11, 4.12, 4.13, 7.7, 7.8, 8.2-8.4**

  - [ ] 4.10 实现用户端点
    - GET /users/{wallet_address}/nfts - 获取用户NFT（支持类型筛选）
    - GET /users/{wallet_address}/stats - 获取用户统计
    - _Requirements: 5.2, 5.3, 5.6, 5.8_

  - [ ]* 4.11 编写用户端点属性测试
    - **Property 17: 个人中心数据分类**
    - **Validates: Requirements 5.2, 5.3, 5.6, 5.8**

  - [ ] 4.12 实现速率限制中间件
    - 创建速率限制装饰器
    - 实现不同操作的限制规则（铸造、搜索、API）
    - 集成到相关端点
    - _Requirements: 2.13, 6.5, 10.4_

  - [ ]* 4.13 编写速率限制属性测试
    - **Property 21: 速率限制保护**
    - **Validates: Requirements 2.13, 6.5, 10.4**

  - [ ] 4.14 实现安全中间件
    - XSS防护（输入清理和转义）
    - 错误处理中间件（友好错误消息）
    - CORS配置
    - _Requirements: 10.5, 10.9_

  - [ ]* 4.15 编写安全中间件属性测试
    - **Property 26: XSS防护**
    - **Property 28: 错误消息安全性**
    - **Validates: Requirements 10.5, 10.9**

- [ ] 5. Checkpoint - 后端测试和验证
  - 运行所有后端测试确保通过
  - 使用Postman/Thunder Client测试所有API端点
  - 验证数据库数据完整性
  - 如有问题请向用户反馈

- [ ] 6. 前端基础设施
  - [ ] 6.1 配置TailwindCSS和主题
    - 配置深色主题色彩方案
    - 配置渐变色和霓虹色
    - 配置玻璃态效果类
    - 配置动画效果
    - _Requirements: 所有UI需求_

  - [ ] 6.2 配置国际化（i18next）
    - 安装i18next和react-i18next
    - 创建翻译文件（zh.json, ja.json, en.json）
    - 配置语言检测和持久化
    - 创建LanguageSwitcher组件
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

  - [ ]* 6.3 编写国际化属性测试
    - **Property 24: 多语言切换一致性**
    - **Property 25: 语言偏好持久化**
    - **Validates: Requirements 9.2-9.6**

  - [ ] 6.4 配置Web3集成
    - 安装ethers.js
    - 创建Web3Provider上下文
    - 创建useWallet自定义Hook
    - 实现钱包连接/断开逻辑
    - 实现网络切换检测
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ]* 6.5 编写Web3集成属性测试
    - **Property 6: 钱包地址脱敏显示**
    - **Property 8: 会话状态管理**
    - **Validates: Requirements 1.4, 1.5**

  - [ ] 6.6 配置状态管理（Zustand）
    - 创建userStore（用户状态）
    - 创建nftStore（NFT数据）
    - 创建uiStore（UI状态）
    - _Requirements: 所有需求_

  - [ ] 6.7 创建API服务层
    - 创建axios实例和拦截器
    - 创建authService（认证相关）
    - 创建nftService（NFT相关）
    - 创建listingService（交易相关）
    - 创建transactionService（交易历史）
    - _Requirements: 所有API需求_

- [ ] 7. 前端通用组件
  - [ ] 7.1 创建Layout组件
    - AppLayout（主布局）
    - Header（顶部导航栏，包含Logo、导航链接、钱包按钮、语言切换）
    - Footer（页脚）
    - _Requirements: 1.1, 9.3_

  - [ ] 7.2 创建钱包组件
    - WalletButton（钱包连接按钮）
    - WalletModal（钱包选择弹窗）
    - 实现连接/断开逻辑
    - 实现地址脱敏显示
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ] 7.3 创建UI基础组件
    - Button（按钮，支持多种变体和加载状态）
    - Modal（模态框）
    - Toast（提示消息）
    - Loading（加载动画，Web3风格）
    - Input（输入框）
    - Select（下拉选择）
    - Textarea（文本域）
    - _Requirements: 所有UI需求_

  - [ ] 7.4 创建NFT展示组件
    - NFTCard（NFT卡片，3D悬浮效果）
    - NFTGrid（NFT网格列表，支持分页）
    - NFTDetail（NFT详情展示）
    - _Requirements: 6.1, 6.2, 7.1, 7.2_

- [ ] 8. 前端页面实现 - 首页和市场
  - [ ] 8.1 实现HomePage（首页）
    - Hero区域（大标题、副标题、CTA按钮、粒子背景动画）
    - TransactionFeed组件（实时交易动态，自动刷新）
    - 热门NFT展示区域
    - 特色分类展示
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

  - [ ]* 8.2 编写HomePage单元测试
    - 测试Hero区域渲染
    - 测试TransactionFeed显示
    - 测试自动刷新功能
    - _Requirements: 8.1-8.6_

  - [ ] 8.3 实现MarketplacePage（市场页）
    - SearchBar组件（搜索框）
    - FilterPanel组件（分类筛选、价格范围筛选）
    - NFTGrid（NFT列表展示）
    - 分页组件
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

  - [ ]* 8.4 编写MarketplacePage单元测试
    - 测试搜索功能
    - 测试筛选功能
    - 测试分页功能
    - _Requirements: 6.1-6.7_

- [ ] 9. 前端页面实现 - NFT铸造
  - [ ] 9.1 实现MintPage（铸造页）
    - 文件上传区域（拖拽上传、预览）
    - MintForm组件（名称、描述、分类、版税）
    - 实时预览区域
    - 进度指示器（上传IPFS → 调用合约 → 完成）
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11, 2.12_

  - [ ]* 9.2 编写MintPage单元测试
    - 测试文件上传验证
    - 测试表单验证
    - 测试铸造流程
    - _Requirements: 2.1-2.12_

  - [ ] 9.3 集成智能合约mint函数
    - 调用合约mint函数
    - 处理交易确认
    - 调用后端API保存元数据
    - 跳转到NFT详情页
    - _Requirements: 2.10, 2.11, 2.12_

- [ ] 10. 前端页面实现 - 个人中心
  - [ ] 10.1 实现ProfilePage（个人中心）
    - 用户信息展示区域（头像、地址、统计数据）
    - 三个标签页（我创作的、我收藏的、出售中）
    - NFTGrid（根据标签显示不同NFT）
    - 操作按钮（出售、销毁、转赠、取消挂单、修改价格）
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10_

  - [ ]* 10.2 编写ProfilePage单元测试
    - 测试标签切换
    - 测试NFT分类显示
    - 测试操作按钮显示逻辑
    - _Requirements: 5.1-5.10_

  - [ ] 10.3 实现ListingForm组件
    - 价格输入和验证
    - 调用智能合约createListing
    - 调用后端API保存挂单
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ] 10.4 实现销毁确认流程
    - BurnModal组件（二次确认对话框）
    - 根据NFT来源显示不同警告
    - 调用智能合约burn函数
    - 调用后端API更新状态
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

  - [ ]* 10.5 编写销毁流程属性测试
    - **Property 11: 销毁后状态更新**
    - **Validates: Requirements 3.7, 3.8**

- [ ] 11. 前端页面实现 - NFT详情
  - [ ] 11.1 实现NFTDetailPage（NFT详情页）
    - NFT大图展示（支持放大查看）
    - 元数据信息展示（名称、描述、属性）
    - 所有者和创作者信息（地址脱敏）
    - 版税信息
    - 价格和购买按钮（如果在售）
    - 交易历史列表
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8_

  - [ ]* 11.2 编写NFTDetailPage单元测试
    - 测试信息展示
    - 测试购买按钮显示逻辑
    - 测试交易历史显示
    - _Requirements: 7.1-7.8_

  - [ ] 11.3 实现购买流程
    - 购买确认对话框
    - 余额检查
    - 调用智能合约buyNFT函数
    - 调用后端API更新数据
    - _Requirements: 4.8, 4.9, 4.10, 4.11, 4.12, 4.13_

  - [ ]* 11.4 编写购买流程属性测试
    - **Property 14: 购买前状态验证**
    - **Property 15: 交易后数据更新**
    - **Property 16: 并发购买防护**
    - **Validates: Requirements 4.8-4.13**

- [ ] 12. Checkpoint - 前端测试和验证
  - 运行所有前端测试确保通过
  - 在浏览器中测试所有页面和功能
  - 测试响应式布局（桌面、平板、手机）
  - 测试多语言切换
  - 测试Web3交互（连接钱包、签名、交易）
  - 如有问题请向用户反馈

- [ ] 13. 集成测试和优化
  - [ ] 13.1 端到端测试
    - 测试完整的铸造流程
    - 测试完整的交易流程
    - 测试完整的销毁流程
    - _Requirements: 所有需求_

  - [ ] 13.2 性能优化
    - 图片懒加载
    - 代码分割
    - API请求缓存
    - 优化动画性能
    - _Requirements: 所有需求_

  - [ ] 13.3 安全审查
    - 检查XSS防护
    - 检查SQL注入防护
    - 检查速率限制
    - 检查错误消息安全性
    - _Requirements: 10.1-10.10_

- [ ] 14. 文档和部署准备
  - [ ] 14.1 编写API文档
    - 使用FastAPI自动生成的Swagger文档
    - 添加详细的端点说明和示例
    - _Requirements: 所有API需求_

  - [ ] 14.2 编写部署文档
    - 智能合约部署指南
    - 后端部署指南
    - 前端部署指南
    - 环境变量配置说明
    - _Requirements: 所有需求_

  - [ ] 14.3 编写用户指南
    - 如何连接钱包
    - 如何铸造NFT
    - 如何交易NFT
    - 常见问题解答
    - _Requirements: 所有需求_

- [ ] 15. Final Checkpoint - 完整系统测试
  - 在测试网络上部署完整系统
  - 执行完整的用户流程测试
  - 验证所有功能正常工作
  - 收集用户反馈并优化
  - 准备主网部署

## Notes

- 任务标记 `*` 的为可选任务（主要是测试相关），可以跳过以加快MVP开发
- 每个任务都引用了具体的需求编号，确保可追溯性
- Checkpoint任务用于阶段性验证，确保增量开发的质量
- 属性测试任务明确标注了对应的设计文档属性编号
- 单元测试和属性测试是互补的，建议都实现以确保代码质量
- 前端开发需要等待智能合约和后端API完成后才能进行完整测试
