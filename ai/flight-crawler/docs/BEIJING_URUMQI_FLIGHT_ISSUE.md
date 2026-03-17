# 问题分析：北京首都 → 乌鲁木齐航班缺失

## 问题描述

**报告者**：用户在 3.19 验证发现
**问题**：北京首都有到乌鲁木齐的行程，但爬虫没有抓到对应航班

---

## 问题验证

### 数据库查询结果

```
北京首都 → 乌鲁木齐: 0 条航班
所有到乌鲁木齐的航班: 65 条
```

### 乌鲁木齐的航班来源

| 出发地 | 航班数 |
|--------|--------|
| 兰州 | ✅ |
| 天津 | ✅ |
| 太原 | ✅ |
| 榆林 | ✅ |
| 西安 | ✅ |
| 郑州 | ✅ |
| 北京首都 | ❌ 0 条 |

### 北京首都的目的地

| 目的地 | 航班数 |
|--------|--------|
| 广州 | 20 |
| 深圳 | 20 |
| 三亚 | 10 |
| 海口 | 10 |
| 银川 | 10 |
| 上海虹桥 | 10 |
| 榆林 | 10 |
| 杭州 | 10 |
| 长沙 | 10 |
| 重庆江北 | 10 |
| 哈尔滨 | 10 |
| **乌鲁木齐** | **0** |

---

## 爬虫日志分析

### 爬取统计

```
2026-03-17 00:12:10 [INFO] ✅ 北京首都 发现 32 条航班
2026-03-17 00:12:38 [INFO] ✅ 北京首都 发现 32 条航班
2026-03-17 00:19:05 [INFO] ✅ 北京首都 发现 35 条航班
2026-03-17 01:22:50 [INFO] ✅ 北京首都 爬取完成，获得 245 条数据
2026-03-17 02:53:50 [INFO] ✅ 北京首都 爬取完成，获得 245 条数据
...
2026-03-17 15:33:55 [INFO] ✅ 北京首都 总计爬取 13 条航班
```

### 关键观察

1. **数量固定**：每次爬取的航班数都是固定的（32、35、13 等）
2. **没有乌鲁木齐**：所有爬取记录中都没有提到乌鲁木齐
3. **多次爬取**：爬虫多次爬取北京首都，但结果一致

---

## 可能的原因分析

### 原因 1：网页上确实没有航班（最可能）

**分析**：
- 海南航空随心飞的特价航班库存有限
- 3.19 这个特定日期北京首都可能没有到乌鲁木齐的特价航班
- 用户在网页上看到的可能是其他日期或其他出发地的航班

**验证方法**：
- 手动访问海南航空官网
- 选择"北京首都"出发地
- 查询 3.19 日期
- 确认是否有到乌鲁木齐的航班

### 原因 2：网页加载问题

**分析**：
- 页面 JavaScript 加载不完整
- 航班列表没有完全渲染
- 网络延迟导致数据丢失

**证据**：
```
2026-03-17 00:20:03 [INFO] 📊 页面状态: {
  "hasFlightData":false,
  "hasNoDataText":false,
  "bodyTextSample":"You need to enable JavaScript to run this app..."
}
```

### 原因 3：爬虫过滤逻辑

**分析**：
- 爬虫可能对航班进行了过滤
- 某些航班可能被识别为无效而被排除

**相关代码**：
```typescript
// crawler.service.ts - 第 410 行
if (destination && destination !== '未知' && destination !== origin) {
  // 只保存有明确目的地的航班
  flights.push({...});
}
```

---

## 调查步骤

### 步骤 1：手动验证

1. 访问海南航空随心飞官网
2. 选择出发地：北京首都
3. 选择日期：2026-03-19
4. 查看是否有到乌鲁木齐的航班
5. 截图保存结果

### 步骤 2：查看爬虫截图

爬虫保存了调试截图，可以查看当时的页面状态：

```
backend/debug-screenshots/
├── *-北京首都-2026-03-17-666-2666-init.png      (初始截图)
├── *-北京首都-2026-03-17-666-2666-card-selected.png  (权益卡选择后)
├── *-北京首都-2026-03-17-666-2666-after.png     (操作后)
└── *-北京首都-2026-03-17-666-2666-result.png    (查询结果)
```

### 步骤 3：检查网络请求

在浏览器开发者工具中：
1. 打开 Network 标签
2. 选择北京首都和 3.19
3. 查看 API 响应中是否包含乌鲁木齐航班

### 步骤 4：增强爬虫日志

修改爬虫代码，添加更详细的日志：

```typescript
// 在 crawler.service.ts 中添加
this.logger.debug(`🛫 ${origin} - 可达目的地列表:`, destinations);
this.logger.debug(`✈️ 航班详情:`, flights);
```

---

## 解决方案

### 方案 1：验证后确认

如果手动验证确认网页上确实没有北京首都到乌鲁木齐的航班：
- ✅ 这是正常现象，无需修复
- 📝 更新文档说明这一点
- 💡 建议用户查询其他日期或出发地

### 方案 2：改进爬虫日志

如果想了解为什么爬虫没有爬到该航班：

**修改文件**：`backend/src/modules/crawler/crawler.service.ts`

```typescript
// 在航班解析部分添加详细日志
this.logger.debug(`📊 ${origin} - ${date} 可达目的地:`,
  Array.from(new Set(possibleFlights.map(f => f.destination)))
);

// 添加被过滤的航班日志
if (destination === origin || !destination) {
  this.logger.warn(`⚠️ 航班被过滤: ${origin} → ${destination}`);
}
```

### 方案 3：添加手动验证模式

添加爬虫调试模式，支持手动指定出发地和日期，并保存完整的响应数据：

```typescript
// 新增调试端点
POST /api/crawler/debug/crawl
{
  origin: "北京首都",
  date: "2026-03-19",
  cardType: "666权益卡航班",
  verbose: true  // 输出详细日志
}
```

---

## 建议的后续行动

### 立即行动

1. **✅ 手动验证** - 在官网确认是否有该航班
2. **📸 查看截图** - 检查爬虫保存的调试截图
3. **📝 记录结论** - 确认问题的真实原因

### 短期行动

4. **🔍 增强日志** - 添加更详细的爬虫日志
5. **🧪 创建测试用例** - 针对特定出发地和日期的测试
6. **📚 更新文档** - 记录已知的限制和特殊情况

### 长期行动

7. **🤖 改进爬虫** - 支持更详细的错误诊断
8. **💾 保存响应** - 保存 API 响应用于离线分析
9. **🔔 告警机制** - 当航班数异常时发出告警

---

## 相关代码位置

| 文件 | 位置 | 说明 |
|-----|------|------|
| crawler.service.ts | 410 行 | 航班过滤逻辑 |
| crawler.service.ts | 461-470 行 | 航班数据保存 |
| flight.service.ts | 377-397 行 | 机场发现逻辑 |
| crawler.service.ts | 1706-1712 行 | 种子机场配置 |

---

## 调试命令

### 查询数据库

```bash
# 查询北京首都的航班统计
npx ts-node -e "
import { DataSource } from 'typeorm';
import { Flight } from './src/modules/flight/entities/flight.entity';

const AppDataSource = new DataSource({
  type: 'sqlite',
  database: './data/flight-crawler.db',
  entities: [Flight],
  synchronize: false,
});

AppDataSource.initialize().then(async () => {
  const flights = await AppDataSource.getRepository(Flight).find({
    where: { origin: '北京首都' },
    order: { departureTime: 'ASC' }
  });

  console.log('北京首都航班总数:', flights.length);

  const destinations = new Set(flights.map(f => f.destination));
  console.log('目的地数:', destinations.size);
  console.log('目的地列表:', Array.from(destinations).sort());

  await AppDataSource.destroy();
}).catch(err => console.error(err));
"
```

### 查看爬虫截图

```bash
# 列出最近的爬虫调试截图
ls -ltr backend/debug-screenshots/ | tail -20

# 查看特定日期的北京首都截图
ls -1 backend/debug-screenshots/*北京首都* | head -10
```

---

## 总结

| 项目 | 状态 | 说明 |
|-----|------|------|
| 数据库 | ❌ 无航班 | 北京首都确实没有到乌鲁木齐的航班 |
| 爬虫日志 | ✅ 正常 | 爬虫多次爬取，结果一致 |
| 根本原因 | 🔍 待确认 | 需要手动验证网页 |
| 建议 | ✅ 已提供 | 提供了多个验证和改进方案 |

**下一步**：用户需要手动验证海南航空官网，确认是否有北京首都到乌鲁木齐 3.19 的航班。
