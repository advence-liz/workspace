#!/bin/bash

# 往返航班功能测试脚本

echo "========================================="
echo "  往返航班功能测试"
echo "========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查后端是否运行
echo -e "${YELLOW}检查后端服务...${NC}"
if ! curl -s http://localhost:3000/api/flights/cities > /dev/null 2>&1; then
    echo "错误: 后端服务未启动，请先运行: cd backend && npm run dev"
    exit 1
fi
echo -e "${GREEN}✓ 后端服务运行正常${NC}"
echo ""

# 测试 1：查询目的地（包含往返信息）
echo -e "${YELLOW}测试 1: 查询目的地（包含往返信息）${NC}"
echo "API: GET /api/flights/destinations"
echo "参数: origin=北京首都, startDate=2026-03-16, endDate=2026-04-16"
echo ""

RESPONSE=$(curl -s "http://localhost:3000/api/flights/destinations?origin=%E5%8C%97%E4%BA%AC%E9%A6%96%E9%83%BD&startDate=2026-03-16&endDate=2026-04-16&flightType=%E5%85%A8%E9%83%A8")

# 检查是否有目的地
DEST_COUNT=$(echo "$RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('totalCount', 0))")
echo -e "${GREEN}✓ 找到 $DEST_COUNT 个目的地${NC}"

# 显示前 3 个目的地的往返信息
echo ""
echo "前 3 个目的地的往返信息："
echo "$RESPONSE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for i, dest in enumerate(data['destinations'][:3], 1):
    print(f\"\n{i}. {dest['destination']}\")
    print(f\"   去程: {dest['flightCount']} 班航班, {len(dest['availableDates'])} 天可选\")
    if dest['hasReturn']:
        print(f\"   返程: {dest['returnFlightCount']} 班航班, {len(dest['returnAvailableDates'])} 天可选\")
        print(f\"   ✓ 可往返\")
    else:
        print(f\"   ✗ 无返程\")
"

echo ""
echo "========================================="
echo ""

# 测试 2：查询往返航班详情
echo -e "${YELLOW}测试 2: 查询往返航班详情${NC}"
echo "API: GET /api/flights/round-trip"
echo "参数: origin=北京首都, destination=广州, startDate=2026-03-17, endDate=2026-03-20"
echo ""

RESPONSE=$(curl -s "http://localhost:3000/api/flights/round-trip?origin=%E5%8C%97%E4%BA%AC%E9%A6%96%E9%83%BD&destination=%E5%B9%BF%E5%B7%9E&startDate=2026-03-17&endDate=2026-03-20&flightType=%E5%85%A8%E9%83%A8")

# 统计航班数量
OUTBOUND_COUNT=$(echo "$RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(len(data.get('outboundFlights', [])))")
RETURN_COUNT=$(echo "$RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(len(data.get('returnFlights', [])))")

echo -e "${GREEN}✓ 去程航班: $OUTBOUND_COUNT 班${NC}"
echo -e "${GREEN}✓ 返程航班: $RETURN_COUNT 班${NC}"

# 显示第一班去程和返程航班
echo ""
echo "示例航班："
echo "$RESPONSE" | python3 -c "
import sys, json
from datetime import datetime

data = json.load(sys.stdin)

if data['outboundFlights']:
    flight = data['outboundFlights'][0]
    dept = datetime.fromisoformat(flight['departureTime'].replace('Z', '+00:00'))
    arr = datetime.fromisoformat(flight['arrivalTime'].replace('Z', '+00:00'))
    print(f\"去程: {flight['flightNo']} {flight['origin']} → {flight['destination']}\")
    print(f\"      {dept.strftime('%Y-%m-%d %H:%M')} - {arr.strftime('%H:%M')}\")

if data['returnFlights']:
    flight = data['returnFlights'][0]
    dept = datetime.fromisoformat(flight['departureTime'].replace('Z', '+00:00'))
    arr = datetime.fromisoformat(flight['arrivalTime'].replace('Z', '+00:00'))
    print(f\"\n返程: {flight['flightNo']} {flight['origin']} → {flight['destination']}\")
    print(f\"      {dept.strftime('%Y-%m-%d %H:%M')} - {arr.strftime('%H:%M')}\")
"

echo ""
echo "========================================="
echo -e "${GREEN}测试完成！${NC}"
echo ""
echo "前端访问地址: http://localhost:5173"
echo "在目的地查询页面可以查看往返航班信息"
