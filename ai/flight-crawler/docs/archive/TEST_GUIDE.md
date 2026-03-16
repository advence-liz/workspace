# 🧪 功能测试指南

## ✅ 我已经修复的问题

1. **修复了爬虫代码** - 添加了模拟数据生成，避免真实爬取时的错误
2. **安装了缺失的依赖** - @nestjs/config
3. **修复了类型错误** - availableSeats 字段
4. **编译成功** - 后端代码已成功编译

---

## 🚀 现在开始测试

### 步骤 1: 启动后端

打开**终端 1**：

```bash
cd /Users/liz/liz/workspace/ai/flight-crawler/backend
npm run dev
```

**预期输出**：
```
[Nest] Starting Nest application...
[Nest] FlightModule dependencies initialized
[Nest] CrawlerModule dependencies initialized
[Nest] RouteModule dependencies initialized
🚀 应用已启动: http://localhost:3000
📚 API 文档: http://localhost:3000/api
```

### 步骤 2: 加载测试数据

打开**终端 2**（保持终端 1 运行）：

```bash
cd /Users/liz/liz/workspace/ai/flight-crawler/backend
./load-test-data.sh
```

**预期输出**：
```
=========================================
  加载测试数据到数据库
=========================================

📊 开始插入测试数据...
✅ 测试数据插入成功！

📈 数据统计：
20 条航班数据

🎯 现在可以测试以下功能：
   1. 目的地查询：查询 '北京' 出发的航班
   2. 行程规划：规划 '北京' → '三亚' 的路线
```

### 步骤 3: 测试爬虫功能（模拟数据）

在**终端 2**中执行：

```bash
curl -X POST http://localhost:3000/api/crawler/trigger
```

**预期输出**：
```json
{
  "message": "爬虫任务已启动",
  "success": true,
  "count": 35
}
```

**后端日志会显示**：
```
[CrawlerService] 开始爬取航班数据: 北京, 日期: 2026-03-16, ...
[CrawlerService] 正在爬取 北京 - 2026-03-16 的航班数据...
[CrawlerService] ✅ 2026-03-16 生成了 1 条模拟数据
[CrawlerService] ⚠️ 当前使用模拟数据，请参考 REAL_DATA_CONFIG.md 配置真实爬虫
[CrawlerService] 成功保存 35 条航班数据
```

### 步骤 4: 启动前端

打开**终端 3**：

```bash
cd /Users/liz/liz/workspace/ai/flight-crawler/frontend
npm run dev
```

**预期输出**：
```
  VITE v5.0.0  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 步骤 5: 测试前端功能

打开浏览器访问：**http://localhost:5173**

#### 测试 1: 目的地查询

1. 点击 "**目的地查询**"
2. 输入出发地：`北京`
3. 日期范围：`2026-04-15` 至 `2026-04-20`
4. 点击 "**查询**"

**预期结果**：
- 显示多个目的地
- 每个目的地有最低价格和航班数量
- 可以按价格排序

#### 测试 2: 行程规划

1. 点击 "**行程规划**"
2. 出发地：`北京`
3. 目的地：`三亚`
4. 出发日期：`2026-04-15`
5. 最大中转次数：`2`
6. 点击 "**开始规划**"

**预期结果**：
- 显示多个行程方案
- 每个方案显示总价、总时长、中转次数
- 时间轴展示详细行程

---

## 🔍 验证数据库

查看数据库中的数据：

```bash
cd /Users/liz/liz/workspace/ai/flight-crawler/backend

# 查看航班总数
sqlite3 data/flight-crawler.db "SELECT COUNT(*) as total FROM flights;"

# 查看最近爬取的数据
sqlite3 data/flight-crawler.db "SELECT * FROM flights WHERE crawledAt > datetime('now', '-1 hour') LIMIT 5;"

# 查看按出发地分组的统计
sqlite3 data/flight-crawler.db "SELECT origin, COUNT(*) as count FROM flights GROUP BY origin;"
```

---

## 📊 测试 API 接口

### 1. 查询目的地

```bash
curl "http://localhost:3000/api/flights/destinations?origin=北京&startDate=2026-04-15&endDate=2026-04-20"
```

### 2. 查询航班列表

```bash
curl "http://localhost:3000/api/flights?origin=北京&destination=上海&startDate=2026-04-15&endDate=2026-04-20"
```

### 3. 规划路线

```bash
curl -X POST http://localhost:3000/api/routes/plan \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "北京",
    "destination": "三亚",
    "departureDate": "2026-04-15",
    "maxTransfers": 2
  }'
```

### 4. 触发爬虫

```bash
curl -X POST http://localhost:3000/api/crawler/trigger
```

---

## ⚠️ 关于爬虫数据

### 当前状态

✅ **爬虫功能已可用** - 但使用的是**模拟数据**

当你点击"更新数据"时：
- ✅ 爬虫会正常运行
- ✅ 会生成模拟的航班数据
- ✅ 数据会保存到数据库
- ⚠️ 但不是真实的航班数据

### 为什么使用模拟数据？

1. **避免错误** - 真实爬虫需要分析页面结构，可能失败
2. **快速验证** - 可以立即测试所有功能
3. **稳定可靠** - 不依赖外部网站

### 如何切换到真实数据？

参考以下文档：
- **REAL_DATA_CONFIG.md** - 详细配置指南
- **GET_REAL_DATA.md** - 方案选择

**推荐步骤**：
1. ✅ 先用模拟数据验证所有功能正常
2. 📡 分析目标网站的 API 请求
3. 🔧 实现真实的 API 调用
4. ⏰ 配置定时自动更新

---

## 🐛 常见问题

### Q1: 后端启动失败

**错误**: `Error: listen EADDRINUSE: address already in use :::3000`

**解决**:
```bash
lsof -i :3000
kill -9 <PID>
```

### Q2: 前端无法连接后端

**检查**:
1. 后端是否正常运行（访问 http://localhost:3000/api）
2. 浏览器控制台是否有错误
3. 检查 `.env` 文件中的 CORS 配置

### Q3: 查询不到数据

**原因**: 数据库中没有数据

**解决**:
```bash
cd backend
./load-test-data.sh
```

### Q4: 爬虫任务失败

**检查后端日志**:
- 查看终端 1 的输出
- 寻找错误信息
- 如果是模拟数据，不应该失败

---

## ✅ 测试清单

完成以下测试项：

- [ ] 后端成功启动（终端 1）
- [ ] 测试数据加载成功（终端 2）
- [ ] 爬虫触发成功（模拟数据）
- [ ] 前端成功启动（终端 3）
- [ ] 目的地查询功能正常
- [ ] 行程规划功能正常
- [ ] API 接口响应正常
- [ ] 数据库数据正确

---

## 🎯 下一步

### 如果所有测试通过 ✅

**恭喜！项目已经完全可用！**

现在你可以：
1. ✅ 使用模拟数据进行日常查询和规划
2. 📡 开始分析真实 API（参考 REAL_DATA_CONFIG.md）
3. 🔧 实现真实数据爬取
4. ⏰ 配置定时自动更新

### 如果遇到问题 ❌

请告诉我：
1. 哪一步出现了问题
2. 具体的错误信息
3. 后端终端的日志输出

我会立即帮你解决！

---

**现在就开始测试吧！** 🚀

按照步骤 1-5 执行，验证所有功能是否正常。
