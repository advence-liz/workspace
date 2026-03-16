# 修改日志 - 2026-03-16

## 修改目标
只爬取 666 权益卡和 2666 权益卡航班，有航线就代表可以特价购买。

## 修改内容

### 1. 后端爬虫逻辑 (backend/src/modules/crawler/crawler.service.ts)

#### 修改点 1: 权益卡类型循环爬取
- **位置**: `crawlFlights()` 方法
- **修改**: 增加权益卡类型循环，分别爬取 `666权益卡航班` 和 `2666权益卡航班`
- **代码**:
```typescript
const cardTypes = ['666权益卡航班', '2666权益卡航班'];
for (const date of dates) {
  for (const cardType of cardTypes) {
    const dayFlights = await this.crawlFlightsByDate(origin, date, cardType);
    flights.push(...dayFlights);
    await this.randomDelay();
  }
}
```

#### 修改点 2: 页面交互增强
- **位置**: `crawlFlightsByDate()` 方法
- **修改**:
  1. 增加 `cardType` 参数
  2. 自动选择权益卡类型（点击对应的权益卡按钮）
  3. 自动选择出发地（输入城市名并选择）
  4. 截图文件名包含权益卡类型
- **功能**: 模拟真实用户操作，确保爬取到正确的权益卡数据

#### 修改点 3: 数据过滤优化
- **位置**: API 响应解析和 DOM 提取部分
- **修改**:
  1. 只保存有明确目的地的航班（`destination !== '未知'` 且 `destination !== origin`）
  2. 使用当前爬取的 `cardType` 标记航班
  3. 支持更多可能的字段名称（`arrCity`, `depCity`, `flightNum` 等）
- **逻辑**: 有航线就代表可以特价购买，过滤掉无效数据

### 2. 后端查询逻辑 (backend/src/modules/flight/)

#### 修改点 4: DTO 枚举更新
- **文件**: `dto/query-flights.dto.ts`
- **修改**: 更新枚举值以匹配爬虫保存的格式
```typescript
export enum FlightType {
  ALL = '全部',
  CARD_666 = '666权益卡航班',
  CARD_2666 = '2666权益卡航班',
}
```

#### 修改点 5: Service 查询过滤
- **文件**: `flight.service.ts`
- **修改**:
  1. 导入 `In` 操作符
  2. 默认只查询 666 和 2666 权益卡航班
  3. 当 `flightType` 为 `'全部'` 时，使用 `In(['666权益卡航班', '2666权益卡航班'])`
- **影响**:
  - `queryDestinations()` - 目的地查询
  - `queryFlights()` - 航班列表查询

### 3. 前端界面 (frontend/src/pages/)

#### 修改点 6: 目的地查询页面
- **文件**: `DestinationQuery.tsx`
- **修改**: 更新下拉选项文本以匹配后端
```typescript
<Select.Option value="全部">全部权益卡</Select.Option>
<Select.Option value="666权益卡航班">666权益卡航班</Select.Option>
<Select.Option value="2666权益卡航班">2666权益卡航班</Select.Option>
```

## 数据流变化

### 修改前
- 爬虫: 爬取所有航班 → 标记为 `'全部'`
- 查询: 可选过滤权益卡类型

### 修改后
- 爬虫:
  1. 循环爬取 `666权益卡航班` 和 `2666权益卡航班`
  2. 在页面上选择对应的权益卡类型
  3. 只保存有明确目的地的航班
  4. 标记为具体的权益卡类型
- 查询:
  1. 默认查询 666 和 2666 权益卡航班
  2. 可选择特定权益卡类型
  3. 过滤掉非权益卡航班

## 测试建议

### 1. 爬虫测试
```bash
# 启动后端
cd backend
npm run dev

# 触发爬虫
curl -X POST http://localhost:3000/api/crawler/trigger
```

**检查项**:
- [ ] 查看日志，确认分别爬取了 666 和 2666 权益卡
- [ ] 查看截图文件 `debug-{城市}-{日期}-666.png` 和 `debug-{城市}-{日期}-2666.png`
- [ ] 检查数据库中 `cardType` 字段是否正确

### 2. 查询测试
```bash
# 查询目的地（默认全部权益卡）
curl "http://localhost:3000/api/flights/destinations?origin=北京&startDate=2026-04-01&endDate=2026-04-30"

# 查询特定权益卡
curl "http://localhost:3000/api/flights/destinations?origin=北京&startDate=2026-04-01&endDate=2026-04-30&flightType=666权益卡航班"
```

**检查项**:
- [ ] 返回的航班都是 666 或 2666 权益卡
- [ ] 所有航班都有明确的目的地
- [ ] 价格和日期信息完整

### 3. 前端测试
```bash
# 启动前端
cd frontend
npm run dev
```

**检查项**:
- [ ] 目的地查询页面下拉框显示正确
- [ ] 查询结果只包含权益卡航班
- [ ] 行程规划功能正常

## 注意事项

1. **数据库迁移**: 如果已有旧数据，建议清空数据库重新爬取
   ```bash
   rm backend/data/flight-crawler.db
   ```

2. **爬虫频率**: 由于需要爬取两种权益卡，请求次数翻倍，注意控制频率避免被封

3. **页面结构**: 如果海南航空页面结构变化，需要调整选择器逻辑

4. **错误处理**: 如果某个权益卡类型爬取失败，不会影响另一个类型

## 后续优化建议

1. **并行爬取**: 使用 Promise.all 同时爬取两种权益卡，提高效率
2. **增量更新**: 只更新变化的数据，避免重复爬取
3. **数据验证**: 增加更严格的数据校验规则
4. **监控告警**: 当爬取失败率过高时发送通知
