# 🚀 快速启动指南

## 当前状态
✅ 后端依赖已安装
⏳ 前端依赖安装中...

## 启动步骤

### 方式一：手动启动（推荐用于验证）

#### 1. 启动后端

打开**终端 1**，执行：

```bash
cd /Users/liz/liz/workspace/ai/flight-crawler/backend
npm run dev
```

看到以下输出表示成功：
```
🚀 应用已启动: http://localhost:3000
📚 API 文档: http://localhost:3000/api
```

#### 2. 启动前端

打开**终端 2**，执行：

```bash
cd /Users/liz/liz/workspace/ai/flight-crawler/frontend
npm run dev
```

看到以下输出表示成功：
```
➜  Local:   http://localhost:5173/
```

#### 3. 访问应用

在浏览器中打开：**http://localhost:5173**

---

## 验证功能

### 功能测试 1: 目的地查询

1. 点击顶部菜单 "**目的地查询**"
2. 输入出发地：`北京`
3. 选择日期范围：今天 至 30天后
4. 点击 "**查询**" 按钮

**预期结果**：
- 如果数据库为空，会显示 "查询成功！共找到 0 个目的地"
- 此时需要点击 "**更新数据**" 按钮触发爬虫

### 功能测试 2: 触发爬虫（获取数据）

1. 在 "目的地查询" 页面
2. 点击右上角 "**更新数据**" 按钮
3. 等待爬虫任务完成（几秒到几分钟）

**预期结果**：
- 显示 "爬虫任务已启动，共爬取 X 条数据"
- 后端终端会显示爬虫日志

**注意**：由于目标网站的具体 DOM 结构需要调整，爬虫可能无法获取真实数据。这是正常的，需要根据实际页面结构修改代码。

### 功能测试 3: 行程规划

1. 点击顶部菜单 "**行程规划**"
2. 输入出发地：`北京`
3. 输入目的地：`三亚`
4. 选择出发日期：明天
5. 设置最大中转次数：`2`
6. 点击 "**开始规划**" 按钮

**预期结果**：
- 如果数据库有数据，会显示推荐的行程方案
- 如果无数据，会显示 "未找到合适的行程方案"

---

## API 测试（可选）

### 测试后端 API

打开新终端，使用 curl 测试：

```bash
# 1. 测试健康检查
curl http://localhost:3000/api

# 2. 测试查询目的地
curl "http://localhost:3000/api/flights/destinations?origin=北京&startDate=2026-04-01&endDate=2026-04-30"

# 3. 测试触发爬虫
curl -X POST http://localhost:3000/api/crawler/trigger

# 4. 测试行程规划
curl -X POST http://localhost:3000/api/routes/plan \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "北京",
    "destination": "三亚",
    "departureDate": "2026-05-01",
    "maxTransfers": 2
  }'
```

---

## 常见问题

### Q1: 后端启动失败 - 端口被占用

**错误信息**：
```
Error: listen EADDRINUSE: address already in use :::3000
```

**解决方法**：
```bash
# 查找占用端口的进程
lsof -i :3000

# 杀死进程
kill -9 <PID>
```

### Q2: 前端无法连接后端

**检查**：
1. 后端是否正常启动（访问 http://localhost:3000/api）
2. 浏览器控制台是否有错误
3. 检查 `.env` 文件中的 CORS 配置

### Q3: 爬虫无法获取数据

**原因**：
- 爬虫代码中的 DOM 选择器需要根据实际页面调整
- 目标网站可能有反爬虫机制

**解决方法**：
1. 打开 `backend/src/modules/crawler/crawler.service.ts`
2. 在 `crawlFlightsByDate` 方法中调整数据提取逻辑
3. 使用浏览器开发者工具查看实际的 DOM 结构

### Q4: 查询不到航班数据

**原因**：数据库中没有数据

**解决方法**：
1. 先点击 "更新数据" 触发爬虫
2. 或者手动插入测试数据到数据库

---

## 插入测试数据（可选）

如果爬虫暂时无法工作，可以手动插入测试数据：

```bash
# 进入数据库
sqlite3 backend/data/flight-crawler.db

# 插入测试数据
INSERT INTO flights (flightNo, origin, destination, departureTime, arrivalTime, price, cardType, crawledAt, createdAt, updatedAt)
VALUES
('HU7101', '北京', '上海', '2026-04-15 08:00:00', '2026-04-15 10:30:00', 299, '全部', datetime('now'), datetime('now'), datetime('now')),
('HU7102', '北京', '广州', '2026-04-15 09:00:00', '2026-04-15 12:00:00', 399, '666权益卡', datetime('now'), datetime('now'), datetime('now')),
('HU7103', '北京', '成都', '2026-04-15 10:00:00', '2026-04-15 12:30:00', 350, '全部', datetime('now'), datetime('now'), datetime('now')),
('HU7104', '上海', '三亚', '2026-04-15 14:00:00', '2026-04-15 17:00:00', 450, '全部', datetime('now'), datetime('now'), datetime('now')),
('HU7105', '广州', '三亚', '2026-04-15 15:00:00', '2026-04-15 16:30:00', 199, '2666权益卡', datetime('now'), datetime('now'), datetime('now'));

# 查看数据
SELECT * FROM flights;

# 退出
.quit
```

---

## 查看日志

### 后端日志
- 在后端终端查看实时日志
- 包含爬虫执行状态、API 请求等信息

### 前端日志
- 在浏览器开发者工具的 Console 面板查看
- 包含 API 请求、错误信息等

---

## 下一步

1. ✅ 验证基础功能是否正常
2. 📝 根据实际需求调整爬虫逻辑
3. 🎨 优化前端界面和交互
4. 🚀 部署到生产环境

---

**祝你使用愉快！如有问题，请查看 `docs/QUICK_START.md` 获取更多帮助。**
