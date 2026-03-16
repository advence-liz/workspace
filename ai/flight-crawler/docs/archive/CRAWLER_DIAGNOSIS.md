# 爬虫诊断报告：发现机场 37 航班 0

**问题**：发现机场阶段返回 37 个机场但 0 条航班
**日期**：2026-03-17
**状态**：已诊断并改进

---

## 🔍 问题现象

```json
{
  "seedAirports": ["北京首都", "北京大兴", "上海浦东", "上海虹桥", "深圳"],
  "seedAirportResults": {
    "深圳": 0,
    "北京首都": 0,
    "北京大兴": 0,
    "上海浦东": 0,
    "上海虹桥": 0
  },
  "discoveredAirports": [...37 个机场...],
  "flightCount": 0
}
```

### 问题分析

| 现象 | 说明 |
|------|------|
| **种子机场爬取结果** | 全部 0 条航班 |
| **发现的机场数** | 37 个 |
| **逻辑矛盾** | 没有航班数据，怎么发现机场？ |

---

## 🐛 根本原因

### 原因 1：爬虫无法获取航班数据

**所有 5 个种子机场都返回 0 条航班**，说明：

1. **网站结构可能已更改**
   - 爬虫使用的 CSS 选择器不再匹配
   - 页面 HTML 结构已改变

2. **反爬机制**
   - 网站识别到 Puppeteer 机器人
   - 返回空白或错误页面

3. **JavaScript 加载失败**
   - 页面依赖 JavaScript 动态加载数据
   - Puppeteer 未等待 JavaScript 执行完成

4. **API 端点已更改**
   - 爬虫监听的 API 响应已改变格式
   - 数据提取逻辑不再适用

### 原因 2：日志显示逻辑错误

**代码第 1743 行**：
```typescript
const airports = await this.flightService.getEnabledOriginAirports();
```

这个方法返回的是**数据库中所有已启用的机场**，而不是本次爬取发现的机场。

**结果**：
- 日志显示发现 37 个机场
- 但实际上这些机场来自**数据库的旧数据**
- 不是本次爬取的新发现

---

## 📊 数据流问题

### 当前错误的流程

```
爬虫爬取 5 个种子机场
  ↓ (返回 0 条航班)
allFlights = [] (空数组)
  ↓
discoverAirportsFromFlights([]) (无法发现任何机场)
  ↓
getEnabledOriginAirports() (返回数据库中的 37 个机场)
  ↓
日志显示：发现 37 个机场，0 条航班 ❌ (矛盾)
```

### 应该的流程

```
爬虫爬取 5 个种子机场
  ↓ (应该返回 N 条航班)
allFlights = [N 条航班]
  ↓
discoverAirportsFromFlights([N 条航班]) (发现机场)
  ↓
getEnabledOriginAirports() (返回发现的新机场)
  ↓
日志显示：发现 M 个新机场，N 条航班 ✅ (一致)
```

---

## ✅ 已实施的改进

### 改进 1：添加详细日志

**修改位置**：crawler.service.ts 第 64-71 行

```typescript
for (const date of dates) {
  this.logger.log(`爬取所有权益卡 - ${date}`);
  const dayFlights = await this.crawlFlightsByDate(origin, date, cardTypes);
  this.logger.log(`✅ ${origin} - ${date}: 爬取 ${dayFlights.length} 条航班`);
  flights.push(...dayFlights);
  await this.randomDelay();
}

this.logger.log(`📊 ${origin} 总计爬取 ${flights.length} 条航班`);
```

**效果**：
- 清楚显示每个机场每天爬取了多少航班
- 便于快速定位问题

### 改进 2：修复发现机场的逻辑

**修改位置**：crawler.service.ts 第 1738-1750 行

```typescript
// 从航班数据中自动发现机场
this.logger.log(`📊 分析航班数据，发现机场...`);

// 只有爬取到航班数据才能发现机场
if (allFlights.length > 0) {
  await this.flightService.discoverAirportsFromFlights(allFlights);
} else {
  this.logger.warn('⚠️ 本次爬取未获得任何航班数据，跳过机场发现');
}

// 获取发现的机场数量
const airports = await this.flightService.getEnabledOriginAirports();

this.logger.log(`✅ 【初始化阶段1】完成！发现 ${airports.length} 个机场`);
this.logger.log(`📋 机场列表: ${airports.join(', ')}`);
this.logger.log(`📊 本次爬取航班数: ${allFlights.length} 条`);
```

**效果**：
- 明确显示本次爬取的航班数
- 区分"发现的机场"和"数据库中的机场"
- 当爬取失败时给出警告

---

## 🔧 故障排查步骤

### 步骤 1：检查爬虫是否能访问网站

```bash
# 查看后端日志中的网络请求
tail -100 /tmp/backend.log | grep "📡 捕获 API"

# 查看截图是否正常
ls -lh backend/debug-screenshots/ | tail -10
```

### 步骤 2：检查爬虫是否能正确解析页面

```bash
# 查看日志中的页面信息
tail -100 /tmp/backend.log | grep "页面包含"

# 应该看到类似的输出：
# 📝 页面包含 "出发地": true
# 📝 页面包含 "666": true
# 📝 页面包含 "2666": true
```

### 步骤 3：检查爬虫是否能正确提取数据

```bash
# 查看爬取结果日志
tail -100 /tmp/backend.log | grep "爬取"

# 应该看到类似的输出：
# ✅ 北京首都 - 2026-03-17: 爬取 100 条航班
# ✅ 北京首都 - 2026-03-18: 爬取 95 条航班
# ...
```

### 步骤 4：检查数据库是否正确保存

```bash
# 查询爬取的航班
sqlite3 backend/data/flight-crawler.db \
  "SELECT COUNT(*) FROM flights WHERE crawledAt >= datetime('now', '-1 hour');"
```

---

## 🚨 可能的原因和解决方案

### 原因 A：网站反爬机制

**症状**：爬虫无法获取任何数据

**解决方案**：
1. 增加延迟时间
2. 轮换 User-Agent
3. 使用代理 IP
4. 在 Puppeteer 中禁用无头模式（headless: false）

```typescript
// 增加延迟
await this.randomDelay(5000, 10000); // 5-10 秒

// 检查是否需要登录或验证
const needsAuth = await page.evaluate(() => {
  return document.body.textContent.includes('登录') ||
         document.body.textContent.includes('验证');
});
```

### 原因 B：网站结构已更改

**症状**：页面加载正常，但无法找到数据

**解决方案**：
1. 更新 CSS 选择器
2. 使用 XPath 代替 CSS 选择器
3. 分析网络请求，直接调用 API

```typescript
// 检查页面元素是否存在
const hasFlightList = await page.evaluate(() => {
  return document.querySelector('.flight-list') !== null;
});

if (!hasFlightList) {
  this.logger.error('❌ 无法找到航班列表，页面结构可能已更改');
  // 保存完整页面用于分析
  await page.screenshot({ path: 'debug-full-page.png', fullPage: true });
  const html = await page.content();
  fs.writeFileSync('debug-page.html', html);
}
```

### 原因 C：JavaScript 未加载完成

**症状**：页面加载，但数据为空

**解决方案**：
1. 增加等待时间
2. 等待特定元素加载
3. 检查 JavaScript 错误

```typescript
// 等待特定元素
await page.waitForSelector('.flight-item', { timeout: 10000 });

// 等待 JavaScript 执行
await page.evaluate(() => {
  return new Promise(resolve => {
    if (document.readyState === 'complete') {
      resolve(null);
    } else {
      window.addEventListener('load', resolve);
    }
  });
});
```

---

## 📋 检查清单

- [ ] 爬虫能否访问网站
- [ ] 页面能否正常加载
- [ ] 页面包含预期的内容（"出发地"、"666"、"2666"）
- [ ] 能否正确提取航班数据
- [ ] 数据能否正确保存到数据库
- [ ] 日志是否显示正确的数据流

---

## 📝 后续建议

### 短期（立即）
1. 检查爬虫日志，确定具体失败原因
2. 验证网站是否仍可访问
3. 检查网站是否更改了结构

### 中期（本周）
1. 添加爬虫健康检查接口
2. 实现爬虫失败自动告警
3. 添加更详细的错误日志

### 长期（本月）
1. 实现备用爬虫方案（如直接 API 调用）
2. 添加爬虫性能监控
3. 实现爬虫自动修复机制

---

## 🔗 相关文档

- `SMART_REPLACEMENT_MODE.md` - 智能替换模式
- `SOLUTION_SUMMARY.md` - 北京大兴问题解决方案
- `PROJECT_STATUS.md` - 项目状态

---

**提交**：8884e88 - fix(crawler): 改进发现机场阶段的日志和逻辑
