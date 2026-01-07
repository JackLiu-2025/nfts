#!/bin/bash

echo "🔍 检查提交前的敏感文件..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查计数
ISSUES=0

# 检查 .env 文件
echo "1️⃣  检查环境变量文件..."
if git ls-files | grep -q "\.env$"; then
    echo -e "${RED}❌ 发现 .env 文件被追踪！${NC}"
    git ls-files | grep "\.env$"
    echo -e "${YELLOW}   建议: git rm --cached <file>${NC}"
    ISSUES=$((ISSUES+1))
else
    echo -e "${GREEN}✅ 没有 .env 文件被追踪${NC}"
fi
echo ""

# 检查 node_modules
echo "2️⃣  检查 node_modules..."
if git ls-files | grep -q "node_modules/"; then
    echo -e "${RED}❌ 发现 node_modules 被追踪！${NC}"
    echo -e "${YELLOW}   建议: git rm -r --cached node_modules${NC}"
    ISSUES=$((ISSUES+1))
else
    echo -e "${GREEN}✅ node_modules 未被追踪${NC}"
fi
echo ""

# 检查 Python 缓存
echo "3️⃣  检查 Python 缓存..."
if git ls-files | grep -q "__pycache__"; then
    echo -e "${RED}❌ 发现 __pycache__ 被追踪！${NC}"
    echo -e "${YELLOW}   建议: git rm -r --cached **/__pycache__${NC}"
    ISSUES=$((ISSUES+1))
else
    echo -e "${GREEN}✅ Python 缓存未被追踪${NC}"
fi
echo ""

# 检查日志文件
echo "4️⃣  检查日志文件..."
if git ls-files | grep -q "\.log$"; then
    echo -e "${RED}❌ 发现日志文件被追踪！${NC}"
    git ls-files | grep "\.log$"
    echo -e "${YELLOW}   建议: git rm --cached <file>${NC}"
    ISSUES=$((ISSUES+1))
else
    echo -e "${GREEN}✅ 没有日志文件被追踪${NC}"
fi
echo ""

# 检查编译输出
echo "5️⃣  检查编译输出..."
if git ls-files | grep -E "dist/|build/|artifacts/|cache/"; then
    echo -e "${RED}❌ 发现编译输出被追踪！${NC}"
    git ls-files | grep -E "dist/|build/|artifacts/|cache/" | head -5
    echo -e "${YELLOW}   建议: git rm -r --cached <directory>${NC}"
    ISSUES=$((ISSUES+1))
else
    echo -e "${GREEN}✅ 编译输出未被追踪${NC}"
fi
echo ""

# 检查部署文件
echo "6️⃣  检查部署信息..."
if git ls-files | grep -q "deployment-.*\.json"; then
    echo -e "${YELLOW}⚠️  发现部署信息文件${NC}"
    git ls-files | grep "deployment-.*\.json"
    echo -e "${YELLOW}   注意: 确保不包含敏感信息${NC}"
fi
echo ""

# 检查暂存区中的敏感内容
echo "7️⃣  检查暂存区..."
if git diff --cached --name-only | grep -E "\.env$|\.log$|node_modules|__pycache__"; then
    echo -e "${RED}❌ 暂存区包含敏感文件！${NC}"
    git diff --cached --name-only | grep -E "\.env$|\.log$|node_modules|__pycache__"
    echo -e "${YELLOW}   建议: git reset HEAD <file>${NC}"
    ISSUES=$((ISSUES+1))
else
    echo -e "${GREEN}✅ 暂存区检查通过${NC}"
fi
echo ""

# 总结
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}🎉 所有检查通过！可以安全提交。${NC}"
    echo ""
    echo "建议的提交流程:"
    echo "  1. git status          # 查看状态"
    echo "  2. git diff            # 查看更改"
    echo "  3. git add .           # 添加文件"
    echo "  4. git commit -m \"...\" # 提交"
    echo "  5. git push            # 推送"
    exit 0
else
    echo -e "${RED}⚠️  发现 $ISSUES 个问题，请先解决！${NC}"
    echo ""
    echo "常用修复命令:"
    echo "  git rm --cached <file>           # 移除单个文件"
    echo "  git rm -r --cached <directory>   # 移除目录"
    echo "  git reset HEAD <file>            # 从暂存区移除"
    exit 1
fi
