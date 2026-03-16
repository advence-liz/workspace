#!/bin/bash

# 加载测试数据脚本

echo "========================================="
echo "  加载测试数据到数据库"
echo "========================================="
echo ""

DB_PATH="./data/flight-crawler.db"

if [ ! -f "$DB_PATH" ]; then
    echo "⚠️  数据库文件不存在，将自动创建"
    echo "   请先启动后端服务，让 TypeORM 自动创建表结构"
    echo ""
    echo "   启动命令: npm run dev"
    echo ""
    exit 1
fi

echo "📊 开始插入测试数据..."
sqlite3 "$DB_PATH" < insert-test-data.sql

if [ $? -eq 0 ]; then
    echo "✅ 测试数据插入成功！"
    echo ""
    echo "📈 数据统计："
    sqlite3 "$DB_PATH" "SELECT COUNT(*) || ' 条航班数据' FROM flights;"
    echo ""
    echo "🎯 现在可以测试以下功能："
    echo "   1. 目的地查询：查询 '北京' 出发的航班"
    echo "   2. 行程规划：规划 '北京' → '三亚' 的路线"
    echo ""
else
    echo "❌ 数据插入失败"
    exit 1
fi
