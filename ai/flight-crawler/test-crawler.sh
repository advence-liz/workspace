#!/bin/bash

# 爬虫测试脚本
# 用于验证只爬取 666 和 2666 权益卡航班的修改

echo "========================================="
echo "  爬虫功能测试脚本"
echo "========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 后端 API 地址
API_BASE="http://localhost:3000/api"

# 检查后端服务是否运行
echo -e "${YELLOW}1. 检查后端服务...${NC}"
if curl -s "${API_BASE}/flights/destinations?origin=北京&startDate=2026-04-01&endDate=2026-04-02" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ 后端服务运行正常${NC}"
else
    echo -e "${RED}✗ 后端服务未运行，请先启动后端服务${NC}"
    echo "  cd backend && npm run dev"
    exit 1
fi
echo ""

# 触发爬虫任务
echo -e "${YELLOW}2. 触发爬虫任务...${NC}"
echo "   这将爬取 666 和 2666 权益卡航班数据"
echo "   预计需要 5-10 分钟，请耐心等待..."
echo ""

CRAWLER_RESULT=$(curl -s -X POST "${API_BASE}/crawler/trigger")
echo "${CRAWLER_RESULT}" | python3 -m json.tool 2>/dev/null || echo "${CRAWLER_RESULT}"
echo ""

# 等待爬虫完成
echo -e "${YELLOW}3. 等待爬虫任务完成...${NC}"
sleep 10
echo ""

# 查询数据库中的航班数量
echo -e "${YELLOW}4. 验证爬取结果...${NC}"
echo ""

# 查询所有权益卡航班
echo -e "${BLUE}4.1 查询所有权益卡航班${NC}"
ALL_RESULT=$(curl -s "${API_BASE}/flights/destinations?origin=北京&startDate=2026-04-01&endDate=2026-04-30")
ALL_COUNT=$(echo "${ALL_RESULT}" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('totalCount', 0))" 2>/dev/null || echo "0")
echo "   找到 ${ALL_COUNT} 个目的地"
echo ""

# 查询 666 权益卡航班
echo -e "${BLUE}4.2 查询 666 权益卡航班${NC}"
CARD_666_RESULT=$(curl -s "${API_BASE}/flights/destinations?origin=北京&startDate=2026-04-01&endDate=2026-04-30&flightType=666权益卡航班")
CARD_666_COUNT=$(echo "${CARD_666_RESULT}" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('totalCount', 0))" 2>/dev/null || echo "0")
echo "   找到 ${CARD_666_COUNT} 个目的地"
echo ""

# 查询 2666 权益卡航班
echo -e "${BLUE}4.3 查询 2666 权益卡航班${NC}"
CARD_2666_RESULT=$(curl -s "${API_BASE}/flights/destinations?origin=北京&startDate=2026-04-01&endDate=2026-04-30&flightType=2666权益卡航班")
CARD_2666_COUNT=$(echo "${CARD_2666_RESULT}" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('totalCount', 0))" 2>/dev/null || echo "0")
echo "   找到 ${CARD_2666_COUNT} 个目的地"
echo ""

# 结果汇总
echo "========================================="
echo -e "${GREEN}测试结果汇总${NC}"
echo "========================================="
echo "所有权益卡航班: ${ALL_COUNT} 个目的地"
echo "666 权益卡航班: ${CARD_666_COUNT} 个目的地"
echo "2666 权益卡航班: ${CARD_2666_COUNT} 个目的地"
echo ""

# 验证逻辑
if [ "${ALL_COUNT}" -gt 0 ]; then
    echo -e "${GREEN}✓ 成功爬取到航班数据${NC}"

    if [ "${CARD_666_COUNT}" -gt 0 ] || [ "${CARD_2666_COUNT}" -gt 0 ]; then
        echo -e "${GREEN}✓ 权益卡类型标记正确${NC}"
    else
        echo -e "${RED}✗ 未找到权益卡航班，请检查爬虫逻辑${NC}"
    fi
else
    echo -e "${RED}✗ 未爬取到任何数据，请检查：${NC}"
    echo "   1. 网络连接是否正常"
    echo "   2. 目标网站是否可访问"
    echo "   3. 查看后端日志排查错误"
    echo "   4. 检查截图文件 backend/debug-*.png"
fi
echo ""

# 提示查看截图
echo -e "${YELLOW}提示：${NC}"
echo "查看爬虫截图以验证页面交互："
echo "  ls -lh backend/debug-*.png"
echo ""
echo "查看后端日志："
echo "  tail -f logs/backend.log"
echo ""

echo "========================================="
echo "测试完成！"
echo "========================================="
