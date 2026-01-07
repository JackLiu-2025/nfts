# Git 使用指南

## 项目结构

```
nft-marketplace/
├── frontend/          # React + Vite 前端
├── backend/           # FastAPI 后端
├── contracts/         # Hardhat 智能合约
└── .gitignore        # Git 忽略文件配置
```

## 重要提示 ⚠️

### 敏感文件（绝对不要提交）

以下文件包含敏感信息，**绝对不要提交到 Git**：

1. **环境变量文件**：
   - `frontend/.env`
   - `backend/.env`
   - `contracts/.env`
   - 包含：API 密钥、私钥、数据库密码等

2. **部署信息**：
   - `contracts/deployment-*.json`
   - 可能包含合约地址和部署者信息

3. **日志文件**：
   - `*.log`
   - `backend.log`
   - `frontend.log`

### 应该提交的文件

1. **环境变量示例**：
   - `frontend/.env.example`
   - `backend/.env.example`
   - `contracts/.env.example`
   - 只包含变量名，不包含实际值

2. **配置文件**：
   - `package.json`
   - `requirements.txt`
   - `hardhat.config.js`

3. **源代码**：
   - 所有 `.ts`, `.tsx`, `.py`, `.sol` 文件
   - 测试文件

## 常用 Git 命令

### 初始化和配置

```bash
# 初始化 Git 仓库（如果还没有）
git init

# 配置用户信息
git config user.name "Your Name"
git config user.email "your.email@example.com"

# 查看配置
git config --list
```

### 日常操作

```bash
# 查看状态
git status

# 查看哪些文件会被忽略
git status --ignored

# 添加文件到暂存区
git add .                    # 添加所有文件
git add frontend/            # 只添加前端
git add backend/             # 只添加后端
git add contracts/           # 只添加合约

# 提交更改
git commit -m "feat: 添加可配置平台费用功能"

# 查看提交历史
git log --oneline
git log --graph --oneline --all
```

### 分支管理

```bash
# 创建新分支
git branch feature/new-feature
git checkout -b feature/new-feature  # 创建并切换

# 切换分支
git checkout main
git checkout feature/new-feature

# 查看所有分支
git branch -a

# 合并分支
git checkout main
git merge feature/new-feature

# 删除分支
git branch -d feature/new-feature
```

### 远程仓库

```bash
# 添加远程仓库
git remote add origin https://github.com/username/nft-marketplace.git

# 查看远程仓库
git remote -v

# 推送到远程
git push -u origin main        # 首次推送
git push                       # 后续推送

# 拉取更新
git pull origin main

# 克隆仓库
git clone https://github.com/username/nft-marketplace.git
```

### 撤销操作

```bash
# 撤销工作区的修改
git checkout -- filename

# 撤销暂存区的文件
git reset HEAD filename

# 撤销最后一次提交（保留更改）
git reset --soft HEAD^

# 撤销最后一次提交（丢弃更改）
git reset --hard HEAD^

# 查看某个文件的历史
git log -- filename
```

## 提交信息规范

使用语义化提交信息：

```bash
# 功能
git commit -m "feat: 添加 NFT 挂单功能"
git commit -m "feat(frontend): 实现价格验证"

# 修复
git commit -m "fix: 修复铸造时的 ABI 错误"
git commit -m "fix(backend): 修复索引器启动问题"

# 文档
git commit -m "docs: 更新 README"
git commit -m "docs: 添加 API 文档"

# 样式
git commit -m "style: 格式化代码"

# 重构
git commit -m "refactor: 重构合约费用逻辑"

# 性能
git commit -m "perf: 优化索引器性能"

# 测试
git commit -m "test: 添加费用管理测试"

# 构建
git commit -m "build: 更新依赖"

# CI/CD
git commit -m "ci: 添加 GitHub Actions"

# 其他
git commit -m "chore: 更新 .gitignore"
```

## 检查敏感文件

在提交前，务必检查：

```bash
# 查看将要提交的文件
git status

# 查看具体的更改内容
git diff

# 查看暂存区的更改
git diff --staged

# 确保 .env 文件没有被追踪
git ls-files | grep "\.env$"

# 如果不小心添加了敏感文件，立即移除
git rm --cached frontend/.env
git rm --cached backend/.env
git rm --cached contracts/.env
```

## 如果不小心提交了敏感信息

### 方法 1: 从最近的提交中移除

```bash
# 从 Git 历史中移除文件
git rm --cached frontend/.env
git commit --amend -m "chore: 移除敏感文件"

# 如果已经推送，需要强制推送（危险！）
git push --force
```

### 方法 2: 使用 BFG Repo-Cleaner

```bash
# 安装 BFG
brew install bfg  # macOS

# 清理敏感文件
bfg --delete-files .env
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

### 方法 3: 重要！更换所有密钥

如果敏感信息已经被推送到公开仓库：

1. **立即更换所有密钥和密码**：
   - 重新生成 Pinata API 密钥
   - 更换数据库密码
   - 生成新的钱包私钥（如果泄露）
   - 更新所有 `.env` 文件

2. **通知团队成员**

3. **检查是否有未授权访问**

## 团队协作

### 工作流程

```bash
# 1. 更新主分支
git checkout main
git pull origin main

# 2. 创建功能分支
git checkout -b feature/your-feature

# 3. 开发和提交
git add .
git commit -m "feat: 实现新功能"

# 4. 推送到远程
git push origin feature/your-feature

# 5. 创建 Pull Request（在 GitHub/GitLab 上）

# 6. 代码审查后合并

# 7. 删除本地分支
git checkout main
git branch -d feature/your-feature
```

### 解决冲突

```bash
# 拉取最新代码时出现冲突
git pull origin main

# 手动解决冲突后
git add .
git commit -m "merge: 解决合并冲突"
git push
```

## 最佳实践

1. **频繁提交**：小步快跑，每个功能点提交一次
2. **有意义的提交信息**：清晰描述做了什么
3. **提交前检查**：使用 `git status` 和 `git diff`
4. **不要提交敏感信息**：使用 `.env.example` 代替
5. **保持分支整洁**：及时删除已合并的分支
6. **代码审查**：使用 Pull Request 进行团队协作
7. **定期备份**：推送到远程仓库

## 常见问题

### Q: 如何查看被 .gitignore 忽略的文件？

```bash
git status --ignored
```

### Q: 如何临时忽略某个文件的更改？

```bash
git update-index --assume-unchanged filename
```

### Q: 如何恢复被删除的文件？

```bash
git checkout HEAD -- filename
```

### Q: 如何查看某个文件的修改历史？

```bash
git log -p filename
```

### Q: 如何比较两个分支的差异？

```bash
git diff branch1..branch2
```

## 项目特定注意事项

### 前端

- `node_modules/` 已被忽略
- `dist/` 构建输出已被忽略
- `.env` 包含 Pinata API 密钥，不要提交

### 后端

- `__pycache__/` 已被忽略
- `venv/` 虚拟环境已被忽略
- `.env` 包含数据库密码，不要提交

### 智能合约

- `artifacts/` 编译输出已被忽略
- `cache/` 缓存已被忽略
- `.env` 包含私钥，**绝对不要提交**
- `deployment-*.json` 可能包含敏感信息

## 有用的 Git 别名

在 `~/.gitconfig` 中添加：

```ini
[alias]
    st = status
    co = checkout
    br = branch
    ci = commit
    unstage = reset HEAD --
    last = log -1 HEAD
    visual = log --graph --oneline --all
    amend = commit --amend --no-edit
```

使用：

```bash
git st          # 代替 git status
git co main     # 代替 git checkout main
git visual      # 查看分支图
```

## 参考资源

- [Git 官方文档](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Flight Rules](https://github.com/k88hudson/git-flight-rules)
