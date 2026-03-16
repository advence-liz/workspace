#!/bin/bash

# 随心飞特价行程爬虫工具 - 启动脚本
# 作者: Claude
# 日期: 2026-03-16

set -e

echo "========================================="
echo "  随心飞特价行程爬虫工具 - 启动脚本"
echo "========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查 Node.js
echo -e "${YELLOW}检查 Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}错误: 未检测到 Node.js，请先安装 Node.js >= 18.0.0${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}错误: Node.js 版本过低，需要 >= 18.0.0，当前版本: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js 版本: $(node -v)${NC}"
echo ""

# 检查 npm
echo -e "${YELLOW}检查 npm...${NC}"
if ! command -v npm &> /dev/null; then
    echo -e "${RED}错误: 未检测到 npm${NC}"
    exit 1
fi

echo -e "${GREEN}✓ npm 版本: $(npm -v)${NC}"
echo ""

# 安装后端依赖
echo -e "${YELLOW}安装后端依赖...${NC}"
cd backend
if [ ! -d "node_modules" ]; then
    npm install
    echo -e "${GREEN}✓ 后端依赖安装完成${NC}"
else
    echo -e "${GREEN}✓ 后端依赖已存在${NC}"
fi
echo ""

# 配置环境变量
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}创建环境变量文件...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ 环境变量文件创建完成${NC}"
else
    echo -e "${GREEN}✓ 环境变量文件已存在${NC}"
fi
echo ""

# 创建数据目录
if [ ! -d "data" ]; then
    mkdir -p data
    echo -e "${GREEN}✓ 数据目录创建完成${NC}"
fi
echo ""

# 安装前端依赖
echo -e "${YELLOW}安装前端依赖...${NC}"
cd ../frontend
if [ ! -d "node_modules" ]; then
    npm install
    echo -e "${GREEN}✓ 前端依赖安装完成${NC}"
else
    echo -e "${GREEN}✓ 前端依赖已存在${NC}"
fi
echo ""

# 返回项目根目录
cd ..

echo "========================================="
echo -e "${GREEN}  安装完成！准备启动服务...${NC}"
echo "========================================="
echo ""

# 启动后端（后台运行）
echo -e "${YELLOW}启动后端服务...${NC}"
cd backend
npm run dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✓ 后端服务已启动 (PID: $BACKEND_PID)${NC}"
echo ""

# 等待后端启动
echo -e "${YELLOW}等待后端服务就绪...${NC}"
sleep 5

# 检查后端是否启动成功
if ps -p $BACKEND_PID > /dev/null; then
    echo -e "${GREEN}✓ 后端服务运行正常${NC}"
else
    echo -e "${RED}✗ 后端服务启动失败，请查看日志: logs/backend.log${NC}"
    exit 1
fi
echo ""

# 启动前端
echo -e "${YELLOW}启动前端服务...${NC}"
cd ../frontend
npm run dev

# 注意：前端会占用当前终端，Ctrl+C 退出时会自动清理
