# 🕷️ 真实数据爬取配置指南

## 📌 重要说明

**爬虫需要手动调整才能获取真实数据**，因为：
1. 目标网站的 DOM 结构是动态的
2. 可能有验证码、登录等反爬机制
3. 页面可能使用 JavaScript 动态加载数据

---

## 🔧 配置步骤

### 步骤 1: 调试页面结构

我已经为你准备了一个调试工具，可以帮你分析页面结构。

#### 1.1 添加调试接口

在 `backend/src/modules/crawler/crawler.controller.ts` 中添加：

```typescript
import { Controller, Post, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { CrawlerService } from './crawler.service';

@Controller('crawler')
export class CrawlerController {
  constructor(private readonly crawlerService: CrawlerService) {}

  /**
   * 调试页面结构
   * GET /api/crawler/debug
   */
  @Get('debug')
  @HttpCode(HttpStatus.OK)
  async debugPage() {
    // 注意：这需要你先实现 debugPageStructure 方法
    return {
      message: '请使用浏览器开发者工具手动分析页面',
      url: 'https://m.hnair.com/hnams/plusMember/ableAirlineQuery',
      steps: [
        '1. 在浏览器中打开目标网址',
        '2. 按 F12 打开开发者工具',
        '3. 切换到移动设备模式（iPhone）',
        '4. 在 Elements 面板查看 DOM 结构',
        '5. 在 Network 面板查看 API 请求',
      ],
    };
  }

  @Post('trigger')
  @HttpCode(HttpStatus.OK)
  async triggerCrawl() {
    const result = await this.crawlerService.triggerCrawl();
    return {
      message: result.success ? '爬虫任务已启动' : '爬虫任务失败',
      ...result,
    };
  }
}
```

### 步骤 2: 手动分析页面

#### 2.1 打开目标页面

在浏览器中访问：
```
https://m.hnair.com/hnams/plusMember/ableAirlineQuery
```

#### 2.2 打开开发者工具

- **Chrome/Edge**: 按 `F12` 或 `Cmd+Option+I` (Mac)
- 切换到**移动设备模式**（点击设备图标）
- 选择 **iPhone 12 Pro** 或类似设备

#### 2.3 分析页面元素

在 **Elements** 面板中，查找以下元素：

**出发地输入框**:
```html
<!-- 示例，实际可能不同 -->
<input placeholder="请选择出发地" class="origin-input" />
```

**目的地输入框**:
```html
<input placeholder="请选择到达地" class="dest-input" />
```

**日期选择器**:
```html
<input placeholder="03月16日周一" class="date-picker" />
```

**查询按钮**:
```html
<button class="search-btn">查询航班</button>
```

**航班结果列表**:
```html
<div class="flight-list">
  <div class="flight-item">
    <div class="flight-no">HU7101</div>
    <div class="time">08:00 - 10:30</div>
    <div class="price">¥299</div>
  </div>
</div>
```

#### 2.4 查看 Network 请求

切换到 **Network** 面板：

1. 点击"查询航班"按钮
2. 查看发出的 HTTP 请求
3. 找到返回航班数据的 API 接口

**可能的 API 格式**:
```
GET https://m.hnair.com/api/flights?origin=北京&destination=上海&date=2026-04-15
```

如果找到了 API 接口，**直接调用 API 比爬取页面更高效！**

### 步骤 3: 调整爬虫代码

根据步骤 2 的分析结果，修改 `backend/src/modules/crawler/crawler.service.ts`:

#### 3.1 修改选择器

在 `crawlFlightsByDate` 方法中，替换 TODO 部分：

```typescript
// 1. 选择出发地
await page.waitForSelector('.origin-input'); // 替换为实际选择器
await page.click('.origin-input');
await page.type('.origin-input', origin);

// 2. 选择目的地（如果需要）
await page.waitForSelector('.dest-input'); // 替换为实际选择器
await page.click('.dest-input');
await page.type('.dest-input', '全部'); // 或者留空查询所有目的地

// 3. 选择日期
await page.waitForSelector('.date-picker'); // 替换为实际选择器
await page.click('.date-picker');
// 可能需要处理日期选择器的弹窗
await page.click(`[data-date="${date}"]`); // 根据实际情况调整

// 4. 点击查询按钮
await page.waitForSelector('.search-btn'); // 替换为实际选择器
await page.click('.search-btn');

// 5. 等待结果加载
await page.waitForSelector('.flight-list', { timeout: 10000 });
```

#### 3.2 提取数据

```typescript
const flightData = await page.evaluate(() => {
  const results: any[] = [];

  // 根据实际 DOM 结构调整
  const flightItems = document.querySelectorAll('.flight-item');

  flightItems.forEach((item) => {
    const flightNo = item.querySelector('.flight-no')?.textContent?.trim();
    const timeText = item.querySelector('.time')?.textContent?.trim();
    const priceText = item.querySelector('.price')?.textContent?.trim();
    const destination = item.querySelector('.destination')?.textContent?.trim();

    // 解析时间 "08:00 - 10:30"
    const [depTime, arrTime] = timeText?.split('-').map(t => t.trim()) || [];

    // 解析价格 "¥299"
    const price = parseFloat(priceText?.replace(/[^\d.]/g, '') || '0');

    if (flightNo && price > 0) {
      results.push({
        flightNo,
        destination,
        departureTime: depTime,
        arrivalTime: arrTime,
        price,
      });
    }
  });

  return results;
});
```

### 步骤 4: 方案选择

根据步骤 2 的分析，选择最合适的方案：

#### 方案 A: 直接调用 API（推荐）

如果在 Network 面板找到了 API 接口：

```typescript
// 在 crawler.service.ts 中添加
async fetchFlightsFromAPI(origin: string, date: string): Promise<any> {
  const response = await fetch(
    `https://m.hnair.com/api/flights?origin=${origin}&date=${date}`,
    {
      headers: {
        'User-Agent': 'Mozilla/5.0...',
        'Referer': 'https://m.hnair.com/',
      },
    }
  );

  return response.json();
}
```

**优点**:
- 速度快
- 不需要 Puppeteer
- 更稳定

#### 方案 B: Puppeteer 爬取（备选）

如果没有找到 API 或 API 有加密签名：

- 使用 Puppeteer 模拟浏览器操作
- 按照步骤 3 调整选择器
- 添加更多的等待和重试逻辑

---

## 🔄 配置定时更新

### 方式 1: 使用 NestJS Schedule

在 `crawler.service.ts` 中添加：

```typescript
import { Cron, CronExpression } from '@nestjs/schedule';

@Cron(CronExpression.EVERY_DAY_AT_2AM)
async handleCron() {
  this.logger.log('🕐 定时任务：开始爬取数据');
  await this.triggerCrawl();
}
```

### 方式 2: 手动触发

在前端点击"更新数据"按钮，调用：
```
POST /api/crawler/trigger
```

---

## 🧪 测试爬虫

### 1. 启动后端（调试模式）

```bash
cd backend
CRAWLER_HEADLESS=false npm run dev
```

设置 `CRAWLER_HEADLESS=false` 可以看到浏览器操作过程。

### 2. 触发爬虫

```bash
curl -X POST http://localhost:3000/api/crawler/trigger
```

### 3. 查看日志

在后端终端查看详细的爬虫日志：
```
[Nest] LOG [CrawlerService] 开始爬取航班数据: 北京, 日期: 2026-04-15
[Nest] LOG [CrawlerService] 访问页面...
[Nest] LOG [CrawlerService] 已输入出发地: 北京
[Nest] LOG [CrawlerService] 已点击查询按钮
[Nest] LOG [CrawlerService] 提取到 15 条航班数据
[Nest] LOG [CrawlerService] 成功保存 15 条航班数据
```

### 4. 验证数据

```bash
sqlite3 backend/data/flight-crawler.db
SELECT COUNT(*) FROM flights WHERE crawledAt > datetime('now', '-1 hour');
```

---

## 🛠 调试技巧

### 1. 截图调试

在关键步骤添加截图：

```typescript
await page.screenshot({ path: `debug-step1.png` });
await page.click('.search-btn');
await page.screenshot({ path: `debug-step2.png` });
```

### 2. 打印页面 HTML

```typescript
const html = await page.content();
console.log(html);
```

### 3. 查看控制台日志

```typescript
page.on('console', msg => console.log('PAGE LOG:', msg.text()));
```

### 4. 捕获错误

```typescript
page.on('pageerror', error => {
  console.log('PAGE ERROR:', error.message);
});
```

---

## 📋 常见问题

### Q1: 页面一直加载不出来

**原因**: 网络问题或页面需要登录

**解决**:
- 检查网络连接
- 增加 timeout 时间
- 查看是否需要登录

### Q2: 找不到选择器

**原因**: 页面结构变化或选择器错误

**解决**:
- 使用浏览器开发者工具重新分析
- 尝试使用 XPath 或其他选择器
- 添加更多的等待时间

### Q3: 数据提取不完整

**原因**: 页面使用懒加载或滚动加载

**解决**:
```typescript
// 滚动到底部
await page.evaluate(() => {
  window.scrollTo(0, document.body.scrollHeight);
});
await page.waitForTimeout(2000);
```

### Q4: 被反爬虫拦截

**原因**: User-Agent、请求频率等被检测

**解决**:
- 使用真实的 User-Agent
- 添加随机延迟
- 使用代理 IP
- 模拟真实用户行为（鼠标移动等）

---

## 🚀 快速开始

### 最简单的方式：使用测试数据

如果暂时无法配置真实爬虫，继续使用测试数据：

```bash
cd backend
./load-test-data.sh
```

测试数据已经足够验证所有功能！

### 配置真实爬虫：

1. 按照步骤 2 分析页面结构
2. 按照步骤 3 调整代码
3. 按照步骤 4 选择方案
4. 测试并调试

---

**需要帮助？** 把页面结构分析的结果告诉我，我可以帮你编写具体的爬虫代码！
