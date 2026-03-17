# 爬虫诊断指南 - 航班缺失问题排查

## 问题背景

**已验证**：3.19 北京首都确实有到乌鲁木齐的航班，但爬虫没有抓到。

**症状**：
- 数据库中：北京首都 → 乌鲁木齐 = 0 条
- 网页上：北京首都有到乌鲁木齐的航班
- 爬虫日志：无错误提示，但结果不完整

---

## 根本原因分析

### 可能的原因

1. **API 响应不包含该航班**
   - 网页显示的航班不在 API 响应中
   - 可能是前端动态加载或特殊处理

2. **航班被过滤器排除**
   - `destination` 字段为空或无法识别
   - `destination` 被识别为"未知"
   - `destination` 等于 `origin`

3. **网页加载不完整**
   - JavaScript 未完全执行
   - 航班数据未加载完成

4. **字段解析错误**
   - `destination`、`arrCity`、`arrival` 都无法正确识别
   - 字段名称与爬虫预期不符

---

## 诊断步骤

### 步骤 1：启用调试日志

修改爬虫配置，启用 DEBUG 级别日志：

**文件**：`backend/src/main.ts`

```typescript
import { Logger } from '@nestjs/common';

const app = await NestFactory.create(AppModule);

// 启用调试日志
if (process.env.NODE_ENV === 'development') {
  Logger.debug = true;
}

await app.listen(3000);
```

或者通过环境变量启用：

```bash
DEBUG=* npm run dev
```

### 步骤 2：运行爬虫并捕获日志

运行爬虫爬取北京首都 3.19 的航班：

```bash
# 启动后端服务
npm run dev

# 在另一个终端运行爬虫任务
curl -X POST http://localhost:3000/api/crawler/trigger
```

### 步骤 3：查看日志输出

关键日志项：

```
📊 所有目的地: 广州, 深圳, 三亚, 海口, 银川, 上海虹桥, 榆林, 杭州, 长沙, 重庆江北, 哈尔滨, ...
```

**检查点**：
- ✅ 乌鲁木齐在列表中 → 问题在过滤器
- ❌ 乌鲁木齐不在列表中 → 问题在 API 响应

```
⚠️ 航班被过滤 (原因): 出发地 → 目的地
```

**原因类型**：
- `无目的地` → destination 字段为空
- `目的地为未知` → destination = "未知"
- `目的地等于出发地` → destination = origin
- `其他` → 其他过滤条件

```
📊 过滤统计: 找到 40 条，过滤 5 条，保存 35 条
```

**检查点**：
- 找到 40 条，保存 35 条 → 有 5 条被过滤
- 找到 35 条，保存 35 条 → 没有被过滤

---

## 场景分析

### 场景 A：乌鲁木齐在"所有目的地"中

**日志示例**：
```
📊 所有目的地: 广州, 深圳, ..., 乌鲁木齐, ...
⚠️ 航班被过滤 (无目的地): 北京首都 → (空)
⚠️ 航班被过滤 (目的地为未知): 北京首都 → 未知
📊 过滤统计: 找到 40 条，过滤 5 条，保存 35 条
```

**原因**：乌鲁木齐航班的 `destination` 字段为空或为"未知"

**解决方案**：
1. 检查 API 响应中乌鲁木齐航班的字段
2. 可能需要使用其他字段（如 `arrCity`、`arrival` 等）
3. 修改爬虫的字段解析逻辑

### 场景 B：乌鲁木齐不在"所有目的地"中

**日志示例**：
```
📊 所有目的地: 广州, 深圳, ..., (不包含乌鲁木齐)
📊 过滤统计: 找到 35 条，过滤 0 条，保存 35 条
```

**原因**：API 响应中根本不包含乌鲁木齐航班

**解决方案**：
1. 检查网页是否真的显示了该航班
2. 可能是网页的动态加载或特殊处理
3. 需要改进爬虫的页面加载机制

---

## 代码改进建议

### 建议 1：添加更详细的字段日志

```typescript
// 在 crawler.service.ts 中添加
this.logger.debug(`🔍 航班字段分析:`, {
  flightNo: flight.flightNo,
  destination: flight.destination,
  arrCity: flight.arrCity,
  arrival: flight.arrival,
  depCity: flight.depCity,
  origin: flight.origin,
  // 其他可能的字段...
});
```

### 建议 2：保存原始 API 响应

```typescript
// 保存完整的 API 响应用于离线分析
if (process.env.SAVE_API_RESPONSE === 'true') {
  const timestamp = Date.now();
  fs.writeFileSync(
    `debug-api-response-${origin}-${date}-${timestamp}.json`,
    JSON.stringify(data, null, 2)
  );
  this.logger.log(`📁 API 响应已保存: debug-api-response-${origin}-${date}-${timestamp}.json`);
}
```

### 建议 3：增强过滤条件

```typescript
// 添加更多的目的地字段识别
const destination =
  flight.destination ||
  flight.arrCity ||
  flight.arrival ||
  flight.arr ||
  flight.arrivalCity ||
  flight.destinationCity ||
  flight.to ||
  flight.toCity ||
  origin; // 最后的备选

// 更详细的过滤日志
if (!destination || destination === '未知' || destination === origin) {
  this.logger.warn(`⚠️ 航班被过滤:`, {
    reason: !destination ? '无目的地' : destination === '未知' ? '目的地为未知' : '目的地等于出发地',
    flightNo: flight.flightNo,
    allPossibleDestinations: {
      destination: flight.destination,
      arrCity: flight.arrCity,
      arrival: flight.arrival,
      arr: flight.arr,
      arrivalCity: flight.arrivalCity,
      destinationCity: flight.destinationCity,
      to: flight.to,
      toCity: flight.toCity,
    }
  });
}
```

---

## 调试命令

### 命令 1：查看最新的调试日志

```bash
# 查看最新的应用日志
tail -f backend/logs/app-$(date +%Y-%m-%d).log | grep -E "所有目的地|航班被过滤|过滤统计"

# 查看调试日志
tail -f backend/logs/debug-$(date +%Y-%m-%d).log | grep "北京首都"
```

### 命令 2：运行特定的爬虫任务

```bash
# 创建一个临时的爬虫测试脚本
cat > /tmp/test-crawler.sh << 'EOF'
#!/bin/bash
cd /Users/liz/liz/workspace/ai/flight-crawler/backend

# 启动后端服务（后台）
npm run dev > /tmp/crawler-test.log 2>&1 &
SERVER_PID=$!

# 等待服务启动
sleep 5

# 运行爬虫
curl -X POST http://localhost:3000/api/crawler/trigger

# 等待爬虫完成
sleep 30

# 查看日志
echo "=== 爬虫日志 ==="
grep -E "北京首都|所有目的地|航班被过滤|过滤统计" /tmp/crawler-test.log

# 清理
kill $SERVER_PID
EOF

chmod +x /tmp/test-crawler.sh
/tmp/test-crawler.sh
```

### 命令 3：查询数据库中的航班

```bash
# 进入 backend 目录
cd backend

# 查询北京首都 3.19 的所有航班
npx ts-node << 'EOF'
import { DataSource } from 'typeorm';
import { Flight } from './src/modules/flight/entities/flight.entity';

const AppDataSource = new DataSource({
  type: 'sqlite',
  database: './data/flight-crawler.db',
  entities: [Flight],
  synchronize: false,
});

AppDataSource.initialize().then(async () => {
  const flights = await AppDataSource.getRepository(Flight)
    .createQueryBuilder('flight')
    .where('flight.origin = :origin', { origin: '北京首都' })
    .andWhere('DATE(flight.departureTime) = :date', { date: '2026-03-19' })
    .orderBy('flight.destination', 'ASC')
    .getMany();

  console.log('北京首都 3.19 的航班:');
  flights.forEach(f => {
    console.log(`  ${f.flightNo}: → ${f.destination}`);
  });

  console.log('\n目的地统计:');
  const destinations = new Map();
  flights.forEach(f => {
    destinations.set(f.destination, (destinations.get(f.destination) || 0) + 1);
  });

  for (const [dest, count] of destinations) {
    console.log(`  ${dest}: ${count} 条`);
  }

  await AppDataSource.destroy();
}).catch(err => console.error(err));
EOF
```

---

## 已实施的改进

### ✅ 改进 1：添加目的地列表日志

**代码**：
```typescript
const allDestinations = possibleFlights.map((f: any) => f.destination || f.arrCity || f.arrival || '(空)');
this.logger.debug(`📊 所有目的地: ${Array.from(new Set(allDestinations)).join(', ')}`);
```

**效果**：可以快速看到 API 返回的所有目的地

### ✅ 改进 2：添加航班过滤原因日志

**代码**：
```typescript
} else {
  filteredCount++;
  const reason = !destination ? '无目的地' : destination === '未知' ? '目的地为未知' : destination === origin ? '目的地等于出发地' : '其他';
  this.logger.debug(`⚠️ 航班被过滤 (${reason}): ${flight.origin || origin} → ${destination || '(空)'}`);
}
```

**效果**：明确显示哪些航班被过滤及原因

### ✅ 改进 3：添加过滤统计日志

**代码**：
```typescript
if (filteredCount > 0) {
  this.logger.debug(`📊 过滤统计: 找到 ${possibleFlights.length} 条，过滤 ${filteredCount} 条，保存 ${flights.length} 条`);
}
```

**效果**：可以看到数据处理的完整流程

---

## 后续步骤

### 立即行动

1. ✅ 部署新的爬虫代码（已完成）
2. 🔄 运行爬虫并收集日志
3. 📊 分析日志输出
4. 🔍 确定根本原因

### 根据诊断结果

**如果乌鲁木齐在"所有目的地"中**：
- 修改字段解析逻辑
- 添加缺失的字段识别
- 重新运行爬虫验证

**如果乌鲁木齐不在"所有目的地"中**：
- 检查网页加载机制
- 可能需要改进 Puppeteer 配置
- 增加等待时间或重试次数

---

## 相关文件

| 文件 | 说明 |
|-----|------|
| crawler.service.ts | 爬虫核心代码，包含诊断日志 |
| flight.service.ts | 航班数据处理 |
| app-YYYY-MM-DD.log | 应用日志文件 |
| debug-YYYY-MM-DD.log | 调试日志文件 |

---

## 总结

通过这个诊断指南，我们可以快速定位航班缺失的原因：

1. **API 响应分析** → 确认乌鲁木齐是否在响应中
2. **字段识别分析** → 确认 destination 字段是否正确识别
3. **过滤原因分析** → 确认航班为什么被过滤
4. **数据库验证** → 确认最终保存的数据

这些信息将帮助我们进行针对性的修复。
