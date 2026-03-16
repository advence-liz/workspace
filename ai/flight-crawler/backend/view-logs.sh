#!/bin/bash

# 日志查看脚本

TODAY=$(date +%Y-%m-%d)
LOG_DIR="logs"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Flight Crawler 日志查看工具${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 检查日志目录
if [ ! -d "$LOG_DIR" ]; then
    echo -e "${RED}错误: 日志目录不存在${NC}"
    exit 1
fi

# 显示菜单
echo -e "${GREEN}请选择要查看的日志：${NC}"
echo "1) 应用日志 (app-$TODAY.log)"
echo "2) 错误日志 (error-$TODAY.log)"
echo "3) 调试日志 (debug-$TODAY.log)"
echo "4) 实时查看应用日志"
echo "5) 实时查看错误日志"
echo "6) 搜索日志内容"
echo "7) 查看所有日志文件"
echo "0) 退出"
echo ""

read -p "请输入选项 [0-7]: " choice

case $choice in
    1)
        echo -e "${YELLOW}查看应用日志（最后 50 行）：${NC}"
        tail -50 "$LOG_DIR/app-$TODAY.log"
        ;;
    2)
        echo -e "${YELLOW}查看错误日志：${NC}"
        if [ -s "$LOG_DIR/error-$TODAY.log" ]; then
            cat "$LOG_DIR/error-$TODAY.log"
        else
            echo -e "${GREEN}✅ 今天没有错误日志${NC}"
        fi
        ;;
    3)
        echo -e "${YELLOW}查看调试日志（最后 50 行）：${NC}"
        tail -50 "$LOG_DIR/debug-$TODAY.log"
        ;;
    4)
        echo -e "${YELLOW}实时查看应用日志（Ctrl+C 退出）：${NC}"
        tail -f "$LOG_DIR/app-$TODAY.log"
        ;;
    5)
        echo -e "${YELLOW}实时查看错误日志（Ctrl+C 退出）：${NC}"
        tail -f "$LOG_DIR/error-$TODAY.log"
        ;;
    6)
        read -p "请输入搜索关键词: " keyword
        echo -e "${YELLOW}搜索结果：${NC}"
        grep -n "$keyword" "$LOG_DIR"/*.log | head -50
        ;;
    7)
        echo -e "${YELLOW}所有日志文件：${NC}"
        ls -lh "$LOG_DIR"/*.log 2>/dev/null || echo "没有日志文件"
        ;;
    0)
        echo -e "${GREEN}退出${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}无效选项${NC}"
        exit 1
        ;;
esac
