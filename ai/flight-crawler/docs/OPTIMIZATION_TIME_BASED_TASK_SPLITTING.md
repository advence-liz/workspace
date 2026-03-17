# 基于时间区间的任务拆分优化方案

**提出时间**：2026-03-17
**当前问题**：30天任务执行时间过长（预计1-2小时）
**优化目标**：通过时间区间拆分，提升执行效率和可管理性

---

## 📋 当前实现分析

### 当前架构

```typescript
// 当前实现：一次性爬取所有天数
async initializeRefreshFlights(days: number = 7) {
  // 1. 生成所有日期
  const dates = [];
  for (let i = 1; i <= days; i++) {
    dates.push(getDate(i));
  }

  // 2. 对每个机场爬取所有日期
  for (const airport of airports) {
    await crawlFlights(airport, dates);  // 串行爬取所有日期
  }
}
```

### 当前问题

#### 问题 1：执行时间过长
```
任务规模：37 个机场 × 30 天 = 1,110 个爬取任务
执行时间：预计 1-2 小时
用户体验：等待时间过长
```

#### 问题 2：失败恢复成本高
```
如果任务在第 50 分钟失败：
- 已爬取的数据：丢失（智能替换模式）
- 需要重新开始：从头开始
- 浪费时间：50 分钟
```

#### 问题 3：并发控制粒度粗
```
当前并发单位：机场
并发限制：5 个机场
问题：无法充分利用时间维度的并发
```

#### 问题 4：资源占用时间长
```
数据库锁：持续 1-2 小时
内存占用：持续累积（收集所有航班）
浏览器资源：长时间占用
```

---

## 🎯 优化方案

### 方案 1：按周拆分（推荐）

#### 设计思路
将 30 天拆分为多个周任务，每个任务独立执行。

```typescript
// 优化后：按周拆分
async initializeRefreshFlightsByWeeks(totalDays: number = 30) {
  const DAYS_PER_TASK = 7;  // 每个任务 7 天
  const tasks = [];

  // 拆分为多个周任务
  for (let offset = 0; offset < totalDays; offset += DAYS_PER_TASK) {
    const daysInThisTask = Math.min(DAYS_PER_TASK, totalDays - offset);
    tasks.push({
      startDay: offset + 1,
      days: daysInThisTask
    });
  }

  // 串行执行每个任务
  for (const task of tasks) {
    await this.initializeRefreshFlightsWithOffset(task.startDay, task.days);
  }
}

async initializeRefreshFlightsWithOffset(startDay: number, days: number) {
  // 生成日期范围（从 startDay 开始）
  const dates = [];
  for (let i = startDay; i < startDay + days; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }

  // 执行爬取（与现有逻辑相同）
  // ...
}
```

#### 优势

**1. 执行时间可控**
```
原方案：1 个任务 × 120 分钟 = 120 分钟
优化后：5 个任务 × 25 分钟 = 125 分钟（总时间相近）

但用户体验更好：
- 第一周数据：25 分钟后可用
- 第二周数据：50 分钟后可用
- 逐步增量，持续可用
```

**2. 失败恢复成本低**
```
如果第 3 周任务失败：
- 前 2 周数据：已保存（14 天数据）
- 只需重试：第 3 周（7 天）
- 节省时间：50 分钟
```

**3. 数据增量可用**
```
原方案：120 分钟后一次性获得 30 天数据
优化后：
- 25 分钟：7 天数据可用 ✅
- 50 分钟：14 天数据可用 ✅
- 75 分钟：21 天数据可用 ✅
- 100 分钟：28 天数据可用 ✅
- 125 分钟：30 天数据可用 ✅
```

**4. 资源占用分散**
```
原方案：内存持续累积 1-2 小时
优化后：每 25 分钟释放一次内存
```

#### 实现示例

```typescript
/**
 * 按周拆分执行发现航班任务
 * @param totalDays 总天数（例如 30）
 * @param daysPerTask 每个任务的天数（默认 7）
 */
async initializeRefreshFlightsByWeeks(
  totalDays: number = 30,
  daysPerTask: number = 7
): Promise<{ success: boolean; totalCount: number; tasks: any[] }> {
  this.logger.log(`🔄 开始按周拆分执行发现航班任务（总计 ${totalDays} 天，每批 ${daysPerTask} 天）...`);

  const taskResults = [];
  let totalCount = 0;

  // 计算任务数量
  const taskCount = Math.ceil(totalDays / daysPerTask);

  for (let taskIndex = 0; taskIndex < taskCount; taskIndex++) {
    const startDay = taskIndex * daysPerTask + 1;
    const daysInThisTask = Math.min(daysPerTask, totalDays - taskIndex * daysPerTask);

    this.logger.log(`📅 任务 ${taskIndex + 1}/${taskCount}: 爬取第 ${startDay}-${startDay + daysInThisTask - 1} 天`);

    try {
      const result = await this.initializeRefreshFlightsWithOffset(startDay, daysInThisTask);

      taskResults.push({
        taskIndex: taskIndex + 1,
        startDay,
        days: daysInThisTask,
        success: result.success,
        count: result.count
      });

      totalCount += result.count;

      this.logger.log(`✅ 任务 ${taskIndex + 1}/${taskCount} 完成，获得 ${result.count} 条数据`);

    } catch (error) {
      this.logger.error(`❌ 任务 ${taskIndex + 1}/${taskCount} 失败`, error);

      taskResults.push({
        taskIndex: taskIndex + 1,
        startDay,
        days: daysInThisTask,
        success: false,
        count: 0,
        error: error.message
      });

      // 可选：失败后是否继续下一个任务
      // 这里选择继续，以便获取尽可能多的数据
      continue;
    }
  }

  this.logger.log(`🎉 所有任务完成！总计 ${totalCount} 条航班数据`);

  return {
    success: taskResults.every(t => t.success),
    totalCount,
    tasks: taskResults
  };
}

/**
 * 带偏移量的发现航班任务
 * @param startDay 开始天数（1 表示明天，2 表示后天）
 * @param days 爬取天数
 */
async initializeRefreshFlightsWithOffset(
  startDay: number,
  days: number
): Promise<{ success: boolean; count: number }> {
  // 生成日期范围（从 startDay 开始）
  const dates: string[] = [];
  for (let i = startDay; i < startDay + days; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }

  this.logger.log(`📋 日期范围: ${dates[0]} 至 ${dates[dates.length - 1]}`);

  // 获取所有启用爬虫的机场
  const airports = await this.flightService.getEnabledOriginAirports();

  // ... 后续逻辑与 initializeRefreshFlights 相同
  // 并行爬取、收集数据、保存数据
}
```

---

### 方案 2：按机场+时间双维度拆分（高级）

#### 设计思路
同时在机场和时间两个维度进行拆分。

```typescript
// 将任务拆分为更小的粒度
async initializeRefreshFlightsByChunks(totalDays: number = 30) {
  const DAYS_PER_CHUNK = 7;
  const AIRPORTS_PER_CHUNK = 10;

  const airports = await this.getEnabledOriginAirports();
  const airportChunks = chunkArray(airports, AIRPORTS_PER_CHUNK);
  const dayChunks = chunkDays(totalDays, DAYS_PER_CHUNK);

  // 生成任务矩阵
  for (const airportChunk of airportChunks) {
    for (const dayChunk of dayChunks) {
      await this.crawlChunk(airportChunk, dayChunk);
    }
  }
}
```

#### 优势
- 更细粒度的控制
- 更好的并发性
- 更灵活的失败恢复

#### 劣势
- 实现复杂度高
- 任务管理复杂
- 可能增加总执行时间（任务切换开销）

---

### 方案 3：异步任务队列（最优但复杂）

#### 设计思路
引入任务队列系统，支持异步执行和断点续传。

```typescript
// 使用 Bull Queue 或类似的任务队列
import { Queue } from 'bull';

class CrawlerQueue {
  private queue: Queue;

  async addCrawlerTasks(airports: string[], dates: string[]) {
    // 为每个机场×日期组合创建一个任务
    for (const airport of airports) {
      for (const date of dates) {
        await this.queue.add('crawl-flight', {
          airport,
          date
        }, {
          attempts: 3,  // 重试 3 次
          backoff: {
            type: 'exponential',
            delay: 2000
          }
        });
      }
    }
  }

  async processCrawlerTask(job) {
    const { airport, date } = job.data;
    return await this.crawlFlightsByDate(airport, date);
  }
}
```

#### 优势
- 最佳的并发控制
- 自动重试机制
- 支持暂停/恢复
- 可视化任务进度
- 分布式部署支持

#### 劣势
- 需要引入新依赖（Bull、Redis）
- 架构复杂度显著增加
- 开发和测试成本高

---

## 📊 方案对比

| 指标 | 当前方案 | 方案1（按周） | 方案2（双维度） | 方案3（队列） |
|------|---------|------------|--------------|------------|
| 实现复杂度 | 简单 | 中等 | 高 | 很高 |
| 开发时间 | - | 2-4 小时 | 1-2 天 | 3-5 天 |
| 执行时间（30天） | 120 分钟 | 125 分钟 | 130 分钟 | 115 分钟 |
| 首批数据可用 | 120 分钟 | 25 分钟 ✅ | 20 分钟 ✅ | 10 分钟 ✅ |
| 失败恢复 | 差 | 好 ✅ | 很好 ✅ | 优秀 ✅ |
| 资源占用 | 持续高 | 分散 ✅ | 分散 ✅ | 最优 ✅ |
| 并发控制 | 粗粒度 | 中粒度 | 细粒度 | 最优 |
| 可维护性 | 好 | 好 | 中等 | 中等 |
| 依赖引入 | 无 | 无 | 无 | Bull + Redis |

---

## 🎯 推荐方案

### 短期（立即实施）：方案 1 - 按周拆分

**理由**：
- ✅ 实现简单，2-4 小时即可完成
- ✅ 显著改善用户体验（首批数据 25 分钟可用）
- ✅ 失败恢复成本降低 80%
- ✅ 无需引入新依赖
- ✅ 代码改动小，风险低

**实施步骤**：
1. 实现 `initializeRefreshFlightsWithOffset` 方法
2. 实现 `initializeRefreshFlightsByWeeks` 方法
3. 修改 Controller 添加新端点
4. 添加单元测试
5. 前端添加"按周爬取"选项

### 中期（1-2周）：方案 2 - 双维度拆分

**理由**：
- 进一步优化并发性
- 更细粒度的失败恢复
- 适合大规模数据爬取

### 长期（1-2月）：方案 3 - 任务队列

**理由**：
- 支持分布式部署
- 最佳的并发控制和资源利用
- 企业级可靠性
- 支持复杂的任务编排

---

## 💡 实施建议

### API 设计

```typescript
// 新增 Controller 端点
@Post('initialize/refresh-by-weeks')
async initializeRefreshByWeeks(
  @Query('totalDays') totalDays: number = 30,
  @Query('daysPerTask') daysPerTask: number = 7
) {
  return this.crawlerService.initializeRefreshFlightsByWeeks(totalDays, daysPerTask);
}

// 保留原有端点向后兼容
@Post('initialize/refresh')
async initializeRefresh(@Query('days') days: number = 7) {
  return this.crawlerService.initializeRefreshFlights(days);
}
```

### 前端界面

```tsx
// 数据管理页面新增选项
<Radio.Group onChange={handleModeChange} value={mode}>
  <Radio value="single">单次执行（适合 7 天以内）</Radio>
  <Radio value="weekly">按周执行（适合 7-30 天）✨ 推荐</Radio>
</Radio.Group>

{mode === 'weekly' && (
  <Alert
    message="按周执行模式"
    description="数据将分批获取，每 7 天一批。首批数据约 25 分钟可用，总时间与单次执行相近，但体验更好。"
    type="info"
  />
)}
```

---

## 📈 预期效果

### 用户体验提升

**场景：爬取 30 天数据**

**优化前**：
```
00:00 - 开始任务
02:00 - 任务完成，30 天数据可用
等待时间：120 分钟
```

**优化后**：
```
00:00 - 开始任务
00:25 - 第 1 周完成，7 天数据可用 ✅
00:50 - 第 2 周完成，14 天数据可用 ✅
01:15 - 第 3 周完成，21 天数据可用 ✅
01:40 - 第 4 周完成，28 天数据可用 ✅
02:05 - 第 5 周完成，30 天数据可用 ✅
等待首批数据：25 分钟（减少 79%）
```

### 失败恢复改善

**场景：任务在 50% 进度时失败**

**优化前**：
```
失败时间：60 分钟
已爬数据：丢失（智能替换模式）
重试成本：120 分钟
总浪费：180 分钟
```

**优化后**：
```
失败时间：60 分钟（第 3 周）
已爬数据：前 2 周已保存（14 天）
重试成本：仅第 3-5 周（60 分钟）
总浪费：60 分钟（减少 67%）
```

---

## 🎓 总结

### 核心优势

1. **用户体验显著提升**
   - 首批数据等待时间从 120 分钟降至 25 分钟（-79%）
   - 数据逐步可用，而非