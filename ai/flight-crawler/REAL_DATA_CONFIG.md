# 🎯 真实数据配置 - 实战指南

## 📌 重要说明

作为个人提效工具，你需要真实数据。我已经为你准备了多种方案：

---

## 🚀 方案对比

| 方案 | 实时性 | 配置难度 | 数据准确性 | 推荐度 |
|------|--------|----------|-----------|--------|
| **方案 A: API 逆向** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 🌟🌟🌟🌟🌟 |
| **方案 B: Puppeteer 爬虫** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 🌟🌟🌟🌟 |
| **方案 C: 定时任务** | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | 🌟🌟🌟 |

---

## 🔍 方案 A: API 逆向（推荐）

### 优点
- ✅ 速度最快
- ✅ 数据最准确
- ✅ 不需要 Puppeteer
- ✅ 资源消耗小

### 步骤

#### 1. 打开浏览器开发者工具

```bash
# 访问目标页面
https://m.hnair.com/hnams/plusMember/ableAirlineQuery

# 按 F12 打开开发者工具
# 切换到 Network 面板
# 勾选 "Preserve log"
```

#### 2. 执行一次查询

1. 输入出发地（如：北京）
2. 选择日期
3. 点击"查询航班"
4. 观察 Network 面板

#### 3. 查找 API 请求

在 Network 面板中查找类型为 **XHR** 或 **Fetch** 的请求：

```
可能的 API 地址:
✅ https://m.hnair.com/api/v1/flights/query
✅ https://m.hnair.com/hnams/api/plusMember/queryFlights
✅ https://api.hnair.com/...
```

#### 4. 分析请求

右键点击请求 → "Copy" → "Copy as cURL"

示例请求:
```bash
curl 'https://m.hnair.com/api/v1/flights' \
  -H 'User-Agent: Mozilla/5.0...' \
  -H 'Content-Type: application/json' \
  --data-raw '{"origin":"BJS","date":"2026-04-15"}'
```

#### 5. 实现 API 调用

创建文件 `backend/src/modules/crawler/api-crawler.service.ts`:

```typescript
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { FlightService } from '../flight/flight.service';

@Injectable()
export class ApiCrawlerService {
  private readonly logger = new Logger(ApiCrawlerService.name);

  constructor(private readonly flightService: FlightService) {}

  async fetchFlights(origin: string, date: string) {
    try {
      // 替换为实际的 API 地址和参数
      const response = await axios.post('https://m.hnair.com/api/v1/flights', {
        origin: origin,
        date: date,
        // 其他必需参数...
      }, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
          'Content-Type': 'application/json',
          'Referer': 'https://m.hnair.com/',
          // 如果需要 token，在这里添加
        },
      });

      const flights = response.data.flights.map(flight => ({
        flightNo: flight.flightNo,
        origin: flight.origin,
        destination: flight.destination,
        departureTime: new Date(flight.departureTime),
        arrivalTime: new Date(flight.arrivalTime),
        price: flight.price,
        availableSeats: flight.availableSeats,
        cardType: flight.cardType || '全部',
        crawledAt: new Date(),
      }));

      await this.flightService.saveFlights(flights);
      return flights.length;
    } catch (error) {
      this.logger.error('API 调用失败', error);
      throw error;
    }
  }
}
```

---

## 🤖 方案 B: Puppeteer 爬虫

### 我已经为你准备了代码

文件位置: `backend/src/modules/crawler/real-crawler.service.ts`

### 特点

- ✅ 完整的浏览器模拟
- ✅ 多种数据提取方法
- ✅ 自动截图调试
- ✅ API 请求监听

### 使用方法

#### 1. 替换现有 crawler.service.ts

```bash
cd backend/src/modules/crawler
mv crawler.service.ts crawler.service.ts.bak
cp real-crawler.service.ts crawler.service.ts
```

#### 2. 测试爬虫

```bash
# 启动后端
npm run dev

# 触发爬虫（新终端）
curl -X POST http://localhost:3000/api/crawler/trigger
```

#### 3. 查看日志

后端终端会显示详细的爬取过程：

```
🕷️ 开始爬取真实数据: 北京, 日期: 2026-04-15
📄 访问页面...
📸 截图已保存: debug-2026-04-15.png
✅ 点击出发地选择器
📡 捕获到 API 响应: https://...
📊 从 DOM 提取到 15 条数据
✅ 2026-04-15 成功提取 15 条航班
✅ 成功保存 15 条航班数据
```

#### 4. 检查截图

```bash
cd backend
open debug-2026-04-15.png
```

查看截图，确认页面是否正常加载。

---

## ⏰ 方案 C: 配置定时任务

### 每天自动更新

在 `crawler.service.ts` 中添加：

```typescript
import { Cron, CronExpression } from '@nestjs/schedule';

// 每天凌晨 2 点自动更新
@Cron(CronExpression.EVERY_DAY_AT_2AM)
async scheduledCrawl() {
  this.logger.log('🕐 定时任务：开始更新航班数据');
  await this.triggerCrawl();
}

// 每 6 小时更新一次
@Cron('0 */6 * * *')
async frequentCrawl() {
  this.logger.log('🔄 定期更新航班数据');
  await this.triggerCrawl();
}
```

---

## 📝 实战步骤（推荐流程）

### 第 1 步: 使用测试数据验证功能（今天）

```bash
cd backend
./load-test-data.sh
```

✅ 确保所有功能正常工作

### 第 2 步: 分析 API 请求（今天晚上）

1. 打开浏览器开发者工具
2. 执行一次查询
3. 找到 API 请求
4. 复制请求详情

### 第 3 步: 实现 API 调用（明天）

1. 根据 API 请求编写代码
2. 测试 API 调用
3. 验证数据准确性

### 第 4 步: 配置定时任务（本周内）

1. 添加定时任务装饰器
2. 设置合适的更新频率
3. 监控运行状态

---

## 🛠 调试技巧

### 1. 查看截图

爬虫会自动截图，查看截图可以了解页面状态：

```bash
cd backend
ls -lh debug-*.png
```

### 2. 查看日志

后端终端会显示详细日志：

```
✅ 成功  ❌ 失败  ⚠️ 警告  📡 API  📊 数据
```

### 3. 调试模式

设置环境变量查看浏览器操作：

```bash
CRAWLER_HEADLESS=false npm run dev
```

### 4. 检查数据

```bash
sqlite3 backend/data/flight-crawler.db
SELECT * FROM flights WHERE crawledAt > datetime('now', '-1 hour');
```

---

## 💡 常见问题

### Q1: 页面一直加载不出来

**原因**: 网络问题或页面需要登录

**解决**:
- 检查网络连接
- 增加 timeout 时间
- 查看是否需要登录

### Q2: 提取不到数据

**原因**: 页面结构变化或选择器错误

**解决**:
- 查看截图 `debug-*.png`
- 分析页面 HTML 结构
- 调整选择器

### Q3: 被反爬虫拦截

**原因**: 请求频率过高

**解决**:
- 增加随机延迟
- 使用真实 User-Agent
- 降低请求频率

---

## 🎯 下一步行动

### 今天（30分钟）

```bash
# 1. 启动项目
cd backend && npm run dev
cd frontend && npm run dev

# 2. 加载测试数据
cd backend && ./load-test-data.sh

# 3. 验证功能
打开 http://localhost:5173
测试目的地查询和行程规划
```

### 今晚（1小时）

1. 打开浏览器开发者工具
2. 分析 API 请求
3. 记录请求详情
4. 把 API 信息发给我

### 明天（2小时）

1. 根据 API 实现调用
2. 测试数据准确性
3. 配置定时任务

---

## 📞 需要帮助？

把以下信息发给我，我可以帮你编写具体代码：

1. **API 请求地址**
   ```
   URL: https://...
   Method: POST/GET
   ```

2. **请求参数**
   ```json
   {
     "origin": "...",
     "date": "..."
   }
   ```

3. **响应格式**
   ```json
   {
     "data": {
       "flights": [...]
     }
   }
   ```

---

**总结**: 先用测试数据验证功能，再慢慢配置真实爬虫。这是最稳妥的方案！✨
