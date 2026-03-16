# ✅ 项目启动与功能验证指南

## 📋 准备工作检查

- ✅ Node.js >= 18.0.0
- ✅ npm >= 9.0.0
- ✅ 后端依赖已安装
- ✅ 前端依赖已安装（或正在安装中）

---

## 🚀 启动项目

### 步骤 1: 启动后端服务

打开**终端 1**：

```bash
cd /Users/liz/liz/workspace/ai/flight-crawler/backend
npm run dev
```

**预期输出**：
```
[Nest] 12345  - 03/16/2026, 10:00:00 AM     LOG [NestFactory] Starting Nest application...
[Nest] 12345  - 03/16/2026, 10:00:00 AM     LOG [InstanceLoader] AppModule dependencies initialized
[Nest] 12345  - 03/16/2026, 10:00:00 AM     LOG [RoutesResolver] FlightController {/api/flights}:
[Nest] 12345  - 03/16/2026, 10:00:00 AM     LOG [RouterExplorer] Mapped {/api/flights/destinations, GET} route
[Nest] 12345  - 03/16/2026, 10:00:00 AM     LOG [RouterExplorer] Mapped {/api/flights, GET} route
[Nest] 12345  - 03/16/2026, 10:00:00 AM     LOG [NestApplication] Nest application successfully started
🚀 应用已启动: http://localhost:3000
📚 API 文档: http://localhost:3000/api
```

### 步骤 2: 加载测试数据

打开**终端 2**（保持终端1运行）：

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

### 步骤 3: 启动前端服务

打开**终端 3**（保持终端1运行）：

```bash
cd /Users/liz/liz/workspace/ai/flight-crawler/frontend
npm run dev
```

**预期输出**：
```
  VITE v5.0.0  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### 步骤 4: 打开浏览器

在浏览器中访问：**http://localhost:5173**

---

## 🧪 功能验证

### 测试 1: 目的地查询 ✈️

#### 操作步骤：
1. 点击顶部菜单 "**目的地查询**"
2. 输入出发地：`北京`
3. 选择日期范围：`2026-04-15` 至 `2026-04-20`
4. 航班类型：选择 "**全部航班**"
5. 点击 "**查询**" 按钮

#### 预期结果：
```
✅ 查询成功！共找到 5 个目的地

目的地列表：
┌──────┬────────┬────────┬──────────┐
│ 目的地 │ 最低价格 │ 航班数量 │ 可用日期  │
├──────┼────────┼────────┼──────────┤
│ 杭州  │ ¥280   │ 2      │ 2 天     │
│ 上海  │ ¥299   │ 2      │ 2 天     │
│ 成都  │ ¥350   │ 2      │ 2 天     │
│ 广州  │ ¥399   │ 2      │ 2 天     │
│ 深圳  │ ¥450   │ 2      │ 2 天     │
└──────┴────────┴────────┴──────────┘
```

#### 验证点：
- ✅ 表格正确显示目的地
- ✅ 价格按从低到高排序
- ✅ 航班数量统计正确
- ✅ 支持点击表头排序

---

### 测试 2: 行程规划 🗺️

#### 操作步骤：
1. 点击顶部菜单 "**行程规划**"
2. 输入出发地：`北京`
3. 输入目的地：`三亚`
4. 选择出发日期：`2026-04-15`
5. 最大中转次数：`2`
6. 最短停留时间：`2` 小时
7. 最长停留时间：`24` 小时
8. 点击 "**开始规划**" 按钮

#### 预期结果：
```
✅ 找到 3 个行程方案

方案 1: （推荐）
┌─────────────────────────────────────┐
│ ¥498  |  8小时  |  1次中转           │
├─────────────────────────────────────┤
│ HU7101  北京 → 上海                 │
│ 08:00 - 10:30 | ¥299 | 2小时30分钟  │
│                                     │
│ ⏱️  在 上海 停留 3小时30分钟         │
│                                     │
│ HU7201  上海 → 三亚                 │
│ 14:00 - 17:00 | ¥450 | 3小时        │
└─────────────────────────────────────┘

方案 2:
┌─────────────────────────────────────┐
│ ¥598  |  7小时30分钟  |  1次中转     │
├─────────────────────────────────────┤
│ HU7102  北京 → 广州                 │
│ 09:00 - 12:00 | ¥399 | 3小时        │
│                                     │
│ ⏱️  在 广州 停留 3小时               │
│                                     │
│ HU7301  广州 → 三亚                 │
│ 15:00 - 16:30 | ¥199 | 1小时30分钟  │
└─────────────────────────────────────┘

方案 3:
┌─────────────────────────────────────┐
│ ¥870  |  9小时  |  1次中转            │
├─────────────────────────────────────┤
│ HU7103  北京 → 成都                 │
│ 10:00 - 12:30 | ¥350 | 2小时30分钟  │
│                                     │
│ ⏱️  在 成都 停留 3小时30分钟         │
│                                     │
│ HU7401  成都 → 三亚                 │
│ 16:00 - 19:00 | ¥520 | 3小时        │
└─────────────────────────────────────┘
```

#### 验证点：
- ✅ 找到多个可行方案
- ✅ 方案按综合评分排序
- ✅ 显示完整的行程时间轴
- ✅ 中转时间在设定范围内（2-24小时）
- ✅ 价格、时长、中转次数统计正确

---

### 测试 3: API 接口测试 🔌

打开新终端，使用 curl 测试：

#### 3.1 查询目的地

```bash
curl "http://localhost:3000/api/flights/destinations?origin=北京&startDate=2026-04-15&endDate=2026-04-20"
```

**预期响应**：
```json
{
  "destinations": [
    {
      "destination": "杭州",
      "minPrice": 280,
      "flightCount": 2,
      "availableDates": ["2026-04-15", "2026-04-19"]
    },
    {
      "destination": "上海",
      "minPrice": 299,
      "flightCount": 2,
      "availableDates": ["2026-04-15", "2026-04-16"]
    }
    // ... 更多目的地
  ],
  "totalCount": 5,
  "dateRange": {
    "start": "2026-04-15",
    "end": "2026-04-20"
  }
}
```

#### 3.2 查询航班列表

```bash
curl "http://localhost:3000/api/flights?origin=北京&destination=上海&startDate=2026-04-15&endDate=2026-04-20"
```

**预期响应**：
```json
[
  {
    "id": 1,
    "flightNo": "HU7101",
    "origin": "北京",
    "destination": "上海",
    "departureTime": "2026-04-15T00:00:00.000Z",
    "arrivalTime": "2026-04-15T02:30:00.000Z",
    "price": 299,
    "availableSeats": 100,
    "cardType": "全部"
  }
  // ... 更多航班
]
```

#### 3.3 规划路线

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

**预期响应**：
```json
{
  "routes": [
    {
      "segments": [
        {
          "flightNo": "HU7101",
          "origin": "北京",
          "destination": "上海",
          "departureTime": "2026-04-15T00:00:00.000Z",
          "arrivalTime": "2026-04-15T02:30:00.000Z",
          "price": 299,
          "duration": 150
        },
        {
          "flightNo": "HU7201",
          "origin": "上海",
          "destination": "三亚",
          "departureTime": "2026-04-15T06:00:00.000Z",
          "arrivalTime": "2026-04-15T09:00:00.000Z",
          "price": 450,
          "duration": 180
        }
      ],
      "totalPrice": 749,
      "totalDuration": 540,
      "transferCount": 1,
      "layovers": [
        {
          "city": "上海",
          "duration": 210
        }
      ],
      "score": 85.5
    }
    // ... 更多方案
  ],
  "searchParams": {
    "origin": "北京",
    "destination": "三亚",
    "departureDate": "2026-04-15",
    "maxTransfers": 2
  }
}
```

---

## 📊 数据库验证

### 查看数据库内容

```bash
cd /Users/liz/liz/workspace/ai/flight-crawler/backend

# 进入数据库
sqlite3 data/flight-crawler.db

# 查看所有航班
SELECT * FROM flights LIMIT 5;

# 统计出发地
SELECT origin, COUNT(*) as count FROM flights GROUP BY origin;

# 查看最便宜的航班
SELECT * FROM flights ORDER BY price LIMIT 5;

# 退出
.quit
```

---

## 🐛 常见问题排查

### 问题 1: 后端启动失败

**错误**: `Error: listen EADDRINUSE: address already in use :::3000`

**解决**:
```bash
# 查找占用端口的进程
lsof -i :3000

# 杀死进程
kill -9 <PID>
```

### 问题 2: 前端无法连接后端

**检查**:
1. 后端是否正常运行：访问 http://localhost:3000/api
2. 浏览器控制台是否有 CORS 错误
3. 检查 `.env` 文件中的 `CORS_ORIGIN` 配置

### 问题 3: 查询结果为空

**原因**: 数据库中没有数据或日期范围不匹配

**解决**:
```bash
# 重新加载测试数据
cd backend
./load-test-data.sh

# 或者调整查询的日期范围为 2026-04-15 至 2026-04-20
```

### 问题 4: 路径规划无结果

**原因**:
- 数据库中没有连接两个城市的航班
- 中转时间约束太严格

**解决**:
1. 确保测试数据已加载
2. 放宽中转时间限制（如 1-48 小时）
3. 选择有中转航班的城市对（如 北京→三亚）

---

## ✅ 验证清单

完成以下检查项：

- [ ] 后端服务成功启动（http://localhost:3000）
- [ ] 前端服务成功启动（http://localhost:5173）
- [ ] 测试数据成功加载（20条航班）
- [ ] 目的地查询功能正常
- [ ] 行程规划功能正常
- [ ] API 接口响应正常
- [ ] 数据库数据正确

---

## 📝 下一步

### 如果所有功能正常：

1. **完善爬虫逻辑**
   - 打开 `backend/src/modules/crawler/crawler.service.ts`
   - 根据实际页面结构调整 DOM 选择器
   - 测试真实数据爬取

2. **优化前端界面**
   - 添加加载动画
   - 优化表格样式
   - 添加图表展示

3. **部署到生产环境**
   - 参考 `docs/DEPLOYMENT.md`
   - 切换到 PostgreSQL
   - 配置 Nginx

### 如果遇到问题：

1. 查看 `docs/QUICK_START.md` 常见问题部分
2. 检查后端和前端的日志输出
3. 使用浏览器开发者工具调试

---

**恭喜！你已经成功启动并验证了项目的核心功能！🎉**

如有任何问题，请查看项目文档或提交 Issue。
