# 🎯 获取真实数据 - 快速指南

## 📊 数据更新方式对比

| 方式 | 实时性 | 难度 | 推荐度 |
|------|--------|------|--------|
| **测试数据** | ❌ 静态 | ⭐ 简单 | ⭐⭐⭐⭐⭐ 开发阶段 |
| **手动触发爬虫** | ✅ 按需 | ⭐⭐⭐ 中等 | ⭐⭐⭐⭐ 小规模使用 |
| **定时自动爬取** | ✅ 定时 | ⭐⭐⭐ 中等 | ⭐⭐⭐ 生产环境 |
| **实时 API 对接** | ✅ 实时 | ⭐⭐⭐⭐⭐ 困难 | ⭐⭐⭐⭐⭐ 理想方案 |

---

## 🚀 方案 1: 使用测试数据（推荐用于验证功能）

### 优点
- ✅ 立即可用，无需配置
- ✅ 数据稳定，便于测试
- ✅ 不依赖外部网站

### 使用方法

```bash
cd /Users/liz/liz/workspace/ai/flight-crawler/backend
./load-test-data.sh
```

**测试数据包含**:
- 20 条航班数据
- 5 个出发城市（北京、上海、广州、成都、深圳）
- 10 个目的地城市
- 支持中转路径查询

### 适用场景
- ✅ 功能开发和测试
- ✅ 演示和展示
- ✅ 算法调试

---

## 🕷️ 方案 2: 配置真实爬虫（需要手动调整）

### 前提条件
⚠️ **需要分析目标网站的页面结构**

### 快速配置步骤

#### 步骤 1: 分析目标页面

打开浏览器，访问：
```
https://m.hnair.com/hnams/plusMember/ableAirlineQuery
```

按 `F12` 打开开发者工具，切换到 **Network** 面板，然后：

1. 输入出发地（如：北京）
2. 选择日期
3. 点击"查询航班"
4. 查看 Network 面板中的请求

**寻找关键 API 请求**:
```
例如:
GET https://m.hnair.com/api/v1/flights?origin=BJS&date=2026-04-15
```

#### 步骤 2: 如果找到了 API

**最佳方案：直接调用 API**

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
      // 替换为实际的 API 地址
      const response = await axios.get('https://m.hnair.com/api/v1/flights', {
        params: {
          origin: origin,
          date: date,
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
          'Referer': 'https://m.hnair.com/',
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

#### 步骤 3: 如果没有找到 API

使用 Puppeteer 爬取页面，参考 `docs/CRAWLER_SETUP.md` 详细配置。

### 配置定时更新

在 `backend/src/modules/crawler/crawler.service.ts` 中添加：

```typescript
import { Cron, CronExpression } from '@nestjs/schedule';

// 每天凌晨 2 点自动更新
@Cron(CronExpression.EVERY_DAY_AT_2AM)
async scheduledCrawl() {
  this.logger.log('🕐 定时任务：开始更新航班数据');
  await this.triggerCrawl();
}

// 每 6 小时更新一次
@Cron(CronExpression.EVERY_6_HOURS)
async frequentCrawl() {
  this.logger.log('🔄 定期更新航班数据');
  await this.triggerCrawl();
}
```

### 手动触发更新

在前端界面点击"更新数据"按钮，或使用 API：

```bash
curl -X POST http://localhost:3000/api/crawler/trigger
```

---

## 🔌 方案 3: 实时 API 对接（理想方案）

### 如果海南航空提供官方 API

联系海南航空获取 API 密钥，然后：

1. 申请 API 访问权限
2. 获取 API Key 和 Secret
3. 配置到 `.env` 文件
4. 实现 API 调用逻辑

### 优点
- ✅ 数据实时准确
- ✅ 稳定可靠
- ✅ 符合规范

### 缺点
- ❌ 可能需要付费
- ❌ 需要申请流程
- ❌ 可能有调用限制

---

## 📝 我的建议

### 阶段 1: 开发和测试（当前）
**使用测试数据**
```bash
./load-test-data.sh
```

### 阶段 2: 原型验证
**配置简单的爬虫**
- 每天手动触发 1-2 次
- 验证数据准确性
- 优化爬虫逻辑

### 阶段 3: 小规模使用
**配置定时爬虫**
- 每天凌晨自动更新
- 添加错误重试
- 监控爬虫状态

### 阶段 4: 生产环境
**对接官方 API**
- 申请正式的 API 访问
- 实现数据缓存
- 负载均衡

---

## 🎯 快速决策

### 如果你的目标是：

#### 1. **学习和练习全栈开发**
→ 使用测试数据即可，专注于功能实现

#### 2. **个人使用或小范围分享**
→ 配置手动触发的爬虫，每天更新 1-2 次

#### 3. **对外提供服务**
→ 必须对接官方 API，确保合规性

---

## ⚡ 立即行动

### 现在就开始验证功能：

```bash
# 1. 启动后端
cd backend
npm run dev

# 2. 加载测试数据（新终端）
cd backend
./load-test-data.sh

# 3. 启动前端（新终端）
cd frontend
npm run dev

# 4. 打开浏览器
open http://localhost:5173
```

### 验证功能正常后，再考虑配置真实爬虫

---

## 📚 相关文档

- **CRAWLER_SETUP.md** - 详细的爬虫配置指南
- **VERIFY.md** - 功能验证指南
- **DEPLOYMENT.md** - 生产环境部署

---

## 🤝 需要帮助？

如果你想配置真实爬虫，请：

1. 按照"步骤 1"分析页面
2. 把 Network 面板中的 API 请求信息发给我
3. 或者把页面的 HTML 结构发给我

我可以帮你编写具体的爬虫代码！

---

**总结**:
- 📊 **测试数据** - 立即可用，推荐用于功能验证
- 🕷️ **真实爬虫** - 需要配置，适合实际使用
- 🔄 **定时更新** - 配置简单，适合生产环境
- 🔌 **官方 API** - 最佳方案，但需要申请

**现在开始用测试数据验证功能吧！** ✨
