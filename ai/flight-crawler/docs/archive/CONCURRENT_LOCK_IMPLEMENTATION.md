# 并发锁实现 - 防止多个爬虫任务同时运行

**实现日期**：2026-03-17
**提交**：1188449
**目标**：防止多个爬虫任务并发执行，避免数据库竞争和数据不一致

---

## 问题描述

### 症状
在诊断过程中发现多个爬虫任务处于 "running" 状态：
- 任务 ID 6: refresh_flights (7 days) - running
- 任务 ID 7: refresh_flights (30 days) - running
- 任务 ID 10: refresh_flights (7 days) - running
- 任务 ID 11: refresh_flights - running

### 根本原因
1. 爬虫代码中没有并发控制机制
2. 允许多个爬虫任务同时运行
3. 导致数据库竞争：多个任务同时执行删除和保存操作
4. 可能造成数据不一致或丢失

### 影响
- **数据库竞争**：多个任务同时修改数据
- **数据不一致**：删除和保存操作交错执行
- **资源浪费**：多个 Puppeteer 浏览器实例并发爬取
- **网站反爬**：请求频率过高，容易触发反爬机制

---

## 解决方案：并发锁机制

### 实现原理

在 CrawlerService 中添加两个私有属性用于并发控制：

```typescript
private isCrawlerRunning = false;      // 标志：爬虫是否正在运行
private runningTaskId: number | null = null;  // 当前运行的任务 ID
```

### 工作流程

```
请求爬虫任务
  ↓
检查 isCrawlerRunning 标志
  ├─ 如果 true（已有任务运行）
  │   ↓
  │   拒绝新任务，返回 { success: false }
  │   ↓
  │   日志：⚠️ 爬虫已在运行中（任务 ID: X），新任务被拒绝
  │
  └─ 如果 false（没有任务运行）
      ↓
      获取锁：isCrawlerRunning = true
      ↓
      执行爬虫任务
      ↓
      任务完成或失败
      ↓
      释放锁：isCrawlerRunning = false
      ↓
      日志：🔓 爬虫锁已释放
```

### 关键特性

✅ **串行执行**：同时只有一个爬虫任务运行
✅ **自动释放**：使用 finally 块确保锁总是被释放
✅ **清晰日志**：记录锁的获取和释放
✅ **拒绝策略**：新任务被拒绝而不是排队等待

---

## 代码实现

### 1. 添加锁属性

```typescript
@Injectable()
export class CrawlerService {
  // ... 其他属性 ...

  private isCrawlerRunning = false;        // 并发锁：防止多个爬虫同时运行
  private runningTaskId: number | null = null;  // 当前运行的任务 ID
}
```

### 2. 在 initializeDiscoverAirports 中添加锁

```typescript
async initializeDiscoverAirports(days: number = 1) {
  // 检查是否有其他爬虫任务正在运行
  if (this.isCrawlerRunning) {
    this.logger.warn(`⚠️ 爬虫已在运行中（任务 ID: ${this.runningTaskId}），新任务被拒绝`);
    return {
      success: false,
      airportCount: 0,
      flightCount: 0,
    };
  }

  // 创建执行日志
  const log = await this.createCrawlerLog(CrawlerTaskType.DISCOVER_AIRPORTS, days);

  // 获取并发锁
  this.isCrawlerRunning = true;
  this.runningTaskId = log.id;

  try {
    // ... 执行爬虫任务 ...
  } finally {
    // 释放并发锁
    this.isCrawlerRunning = false;
    this.runningTaskId = null;
    this.logger.log('🔓 爬虫锁已释放');
  }
}
```

### 3. 在 initializeRefreshFlights 中添加锁

相同的模式应用于 `initializeRefreshFlights` 方法。

---

## 测试场景

### 场景 1：正常执行

```bash
# 请求 1：发现机场
POST /api/crawler/initialize/discover?days=1

# 响应：success = true
# 日志：🔒 爬虫已获取锁
# 日志：🔓 爬虫锁已释放

# 请求 2：发现航班（在请求 1 完成后）
POST /api/crawler/initialize/refresh?days=7

# 响应：success = true
```

### 场景 2：并发请求

```bash
# 请求 1：发现机场
POST /api/crawler/initialize/discover?days=1
# 响应：{ success: true, ... }
# 状态：任务运行中...

# 请求 2：尝试发现航班（在请求 1 完成前）
POST /api/crawler/initialize/refresh?days=7
# 响应：{ success: false, count: 0 }
# 日志：⚠️ 爬虫已在运行中（任务 ID: 1），新任务被拒绝
```

### 场景 3：任务失败恢复

```bash
# 请求 1：发现机场（中途失败）
POST /api/crawler/initialize/discover?days=1
# 任务失败...
# finally 块执行
# 日志：🔓 爬虫锁已释放

# 请求 2：重新尝试（锁已释放）
POST /api/crawler/initialize/discover?days=1
# 响应：{ success: true, ... }
```

---

## 性能分析

### 优势

| 特性 | 说明 |
|------|------|
| **防止竞争** | 多个任务不会同时修改数据库 |
| **资源节省** | 同时只有一个 Puppeteer 实例 |
| **网站友好** | 请求频率降低，不易触发反爬 |
| **数据一致** | 删除和保存操作原子性更强 |
| **简单可靠** | 实现简洁，易于维护和测试 |

### 权衡

| 问题 | 说明 | 解决方案 |
|------|------|---------|
| **排队等待** | 新任务被拒绝，不会排队 | 可选：改为队列方案 |
| **用户体验** | 用户需要轮询检查任务状态 | 可选：WebSocket 实时推送 |
| **单点故障** | 如果任务卡住，后续任务无法运行 | 可选：添加超时机制 |

---

## 后续改进建议

### 短期（可选）

1. **添加超时机制**
   ```typescript
   private crawlerTimeout: NodeJS.Timeout | null = null;

   // 设置 30 分钟超时
   this.crawlerTimeout = setTimeout(() => {
     this.isCrawlerRunning = false;
     this.logger.error('❌ 爬虫任务超时，锁已强制释放');
   }, 30 * 60 * 1000);
   ```

2. **添加队列系统**
   - 维护待执行任务队列
   - 当前任务完成后自动执行下一个

3. **添加健康检查**
   - 定期检查爬虫状态
   - 如果卡住超过阈值，自动恢复

### 中期

1. **事务处理**
   - 使用数据库事务确保删除和保存的原子性
   - 失败时自动回滚

2. **分布式锁**
   - 如果后续部署多个实例，使用 Redis 分布式锁
   - 确保全局唯一的爬虫执行

3. **监控告警**
   - 监控爬虫执行时间
   - 告警长时间未完成的任务

---

## 相关文档

- `SMART_REPLACEMENT_MODE.md` - 智能替换模式
- `CRAWLER_DIAGNOSIS.md` - 爬虫诊断报告
- `CRAWLER_EXECUTION_REPORT.md` - 爬虫执行诊断报告

---

## 提交信息

```
feat(crawler): 添加并发锁防止多个爬虫任务同时运行

- 在 CrawlerService 中添加 isCrawlerRunning 标志和 runningTaskId
- initializeDiscoverAirports() 和 initializeRefreshFlights() 开始时检查锁
- 如果有其他任务运行中，新任务被拒绝并返回 success: false
- 任务完成或失败时释放锁（在 finally 块中）
- 防止数据库竞争和数据不一致
```

---

**实现状态**：✅ 完成
**测试状态**：⏳ 待测试
**部署状态**：⏳ 待部署
**文档状态**：✅ 完成

