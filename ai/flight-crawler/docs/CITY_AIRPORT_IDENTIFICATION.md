# 城市名和机场名识别流程说明

## 概述

Flight Crawler 项目中，**城市名**和**机场名**的识别采用以下策略：

- **机场名**：从爬虫爬取的航班数据中提取（`origin` 和 `destination` 字段）
- **城市名**：从机场名中通过后缀匹配自动提取

---

## 数据流向图

```
┌─────────────────────────────────────────────┐
│ 1. 爬虫爬取航班数据                          │
│    - origin: "北京首都"                      │
│    - destination: "上海浦东"                 │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│ 2. 保存航班到数据库                          │
│    - Flight 表                               │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│ 3. 从航班数据发现机场                        │
│    discoverAirportsFromFlights()            │
│    - 提取 origin 和 destination             │
│    - 调用 extractCityName() 提取城市名      │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│ 4. 保存机场到数据库                          │
│    - Airport 表                              │
│    - name: "北京首都"                        │
│    - city: "北京"                            │
└─────────────────────────────────────────────┘
```

---

## 详细流程

### 第一步：爬虫爬取航班数据

**文件**：`backend/src/modules/crawler/crawler.service.ts`

爬虫通过 Puppeteer 访问海南航空随心飞页面，选择出发城市和日期，爬取航班信息。

#### 出发城市选择（种子机场）

```typescript
// crawler.service.ts - 第 1706-1712 行
const seedAirports = [
  '北京首都',    // 北京市的首都国际机场
  '北京大兴',    // 北京市的大兴国际机场
  '上海浦东',    // 上海市的浦东国际机场
  '上海虹桥',    // 上海市的虹桥国际机场
  '深圳',        // 深圳市的宝安国际机场
];
```

**说明**：
- 这些是**种子机场**，用于初始化爬虫
- 爬虫从这些机场出发，爬取所有可达目的地的航班
- 这样就能发现其他机场（如"北京首都"出发可达"广州白云"）

#### 航班数据提取

爬虫从页面中提取以下信息：

```typescript
// crawler.service.ts - 第 461-470 行
flights.push({
  flightNo: flight.flightNo || flight.flightNumber || 'UNKNOWN',
  origin: flight.origin || flight.depCity || origin,           // 出发地 = 机场名
  destination: destination,                                     // 目的地 = 机场名
  departureTime: depTime,
  arrivalTime: arrTime,
  availableSeats: parseInt(flight.seats || '0') || undefined,
  cardType: detectedCardType,
  crawledAt: new Date(),
});
```

**关键点**：
- `origin` 和 `destination` 都是**完整的机场名称**（如"北京首都"、"上海浦东"）
- 不是简单的城市名（如"北京"、"上海"）

---

### 第二步：从航班数据发现机场

**文件**：`backend/src/modules/flight/flight.service.ts`

#### 发现机制

```typescript
// flight.service.ts - 第 377-397 行
async discoverAirportsFromFlights(flights: Partial<Flight>[]): Promise<void> {
  const airportSet = new Set<{ name: string; city: string }>();

  for (const flight of flights) {
    // 从出发地发现机场
    if (flight.origin) {
      const originCity = this.extractCityName(flight.origin);
      airportSet.add({ name: flight.origin, city: originCity });
    }
    // 从目的地发现机场
    if (flight.destination) {
      const destCity = this.extractCityName(flight.destination);
      airportSet.add({ name: flight.destination, city: destCity });
    }
  }

  // 批量保存机场
  for (const airport of airportSet) {
    await this.saveAirport(airport.name, airport.city);
  }
}
```

**流程**：
1. 遍历所有航班数据
2. 从 `origin` 和 `destination` 中提取机场名
3. 调用 `extractCityName()` 提取城市名
4. 保存到 Airport 表

#### 城市名提取规则

```typescript
// flight.service.ts - 第 403-414 行
private extractCityName(airportName: string): string {
  const airportSuffixes = [
    '首都', '大兴', '浦东', '虹桥', '白云', '宝安', '天河',
    '萧山', '流亭', '周水子', '江北', '双流', '天府', '咸阳',
    '长水', '黄花', '凤凰', '新', '机场'
  ];

  for (const suffix of airportSuffixes) {
    if (airportName.endsWith(suffix)) {
      return airportName.substring(0, airportName.length - suffix.length);
    }
  }

  // 如果没有匹配到后缀，返回原名称
  return airportName;
}
```

**规则**：
- 从右向左匹配已知的**机场后缀**
- 去掉后缀后的部分就是**城市名**

#### 提取示例

| 机场名 | 后缀匹配 | 城市名 |
|--------|---------|--------|
| 北京首都 | 首都 | 北京 |
| 北京大兴 | 大兴 | 北京 |
| 上海浦东 | 浦东 | 上海 |
| 上海虹桥 | 虹桥 | 上海 |
| 深圳 | 无 | 深圳 |
| 广州白云 | 白云 | 广州 |
| 杭州萧山 | 萧山 | 杭州 |
| 成都双流 | 双流 | 成都 |
| 成都天府 | 天府 | 成都 |
| 西安咸阳 | 咸阳 | 西安 |
| 昆明长水 | 长水 | 昆明 |
| 长沙黄花 | 黄花 | 长沙 |
| 南昌凤凰 | 凤凰 | 南昌 |

---

### 第三步：保存机场到数据库

**文件**：`backend/src/modules/flight/flight.service.ts`

```typescript
// flight.service.ts - saveAirport() 方法
private async saveAirport(name: string, city: string): Promise<void> {
  const existing = await this.airportRepository.findOne({ where: { name } });

  if (!existing) {
    const airport = this.airportRepository.create({
      name,
      city,
      enableCrawl: true,
      discoveredAt: new Date(),
    });
    await this.airportRepository.save(airport);
  }
}
```

**数据库结构**：

```sql
CREATE TABLE airport (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,      -- 机场名（如"北京首都"）
  city VARCHAR(50) NOT NULL,              -- 城市名（如"北京"）
  enableCrawl BOOLEAN DEFAULT true,       -- 是否启用爬虫
  discoveredAt TIMESTAMP,                 -- 发现时间
  updatedAt TIMESTAMP                     -- 更新时间
);
```

---

## 实际工作流示例

### 场景：发现机场的完整流程

#### 第一次爬取（发现机场阶段）

1. **选择种子机场**：北京首都
2. **爬取航班**：
   ```
   北京首都 → 上海浦东
   北京首都 → 深圳
   北京首都 → 广州白云
   ```

3. **发现机场**：
   ```
   origin: "北京首都" → city: "北京" → 保存 Airport(name="北京首都", city="北京")
   destination: "上海浦东" → city: "上海" → 保存 Airport(name="上海浦东", city="上海")
   destination: "深圳" → city: "深圳" → 保存 Airport(name="深圳", city="深圳")
   destination: "广州白云" → city: "广州" → 保存 Airport(name="广州白云", city="广州")
   ```

#### 第二次爬取（刷新航班阶段）

1. **获取所有启用的机场**：
   ```typescript
   const airports = await getEnabledOriginAirports();
   // 返回：["北京首都", "上海浦东", "深圳", "广州白云", ...]
   ```

2. **从每个机场出发爬取航班**：
   ```
   北京首都 → 爬取所有目的地
   上海浦东 → 爬取所有目的地
   深圳 → 爬取所有目的地
   广州白云 → 爬取所有目的地
   ...
   ```

3. **发现新机场**：继续发现其他未知机场

---

## 关键特性

### 1. 自动发现机制

- 无需手动配置所有机场
- 从爬虫数据中自动提取
- 支持动态扩展（新发现的机场自动加入）

### 2. 城市名智能提取

- 基于已知的机场后缀列表
- 支持同城多机场（如北京首都、北京大兴）
- 无后缀的机场返回原名（如"深圳"）

### 3. 启用/禁用控制

- 每个机场都有 `enableCrawl` 标志
- 爬虫只从启用的机场出发
- 可通过机场管理页面快速切换

### 4. 数据去重

- 使用 Set 数据结构去重
- 同一机场多次发现只保存一次
- 避免重复数据

---

## 已知的机场后缀

当前支持的机场后缀列表：

```
首都、大兴、浦东、虹桥、白云、宝安、天河、萧山、流亭、周水子、
江北、双流、天府、咸阳、长水、黄花、凤凰、新、机场
```

如果需要添加新的机场后缀，修改 `extractCityName()` 方法中的 `airportSuffixes` 数组即可。

---

## 扩展和改进建议

### 1. 添加机场后缀

如果发现新的机场类型，可以添加到后缀列表：

```typescript
const airportSuffixes = [
  // 现有后缀...
  '新', '机场',
  // 新增后缀
  '栖霞', '溧水', // 南京的新机场
];
```

### 2. 改进城市识别

目前是简单的后缀匹配，可以改进为：
- 使用机场编码（如 PEK、SHA）映射到城市
- 使用地理编码库（如高德地图 API）
- 维护一个机场-城市的映射表

### 3. 支持多城市

某些城市有多个机场，当前设计已支持：
- 北京：北京首都、北京大兴
- 上海：上海浦东、上海虹桥
- 成都：成都双流、成都天府

---

## 总结

| 阶段 | 数据来源 | 识别方式 | 输出 |
|-----|---------|---------|------|
| 爬虫 | 网页 | 页面提取 | 航班数据（机场名） |
| 发现 | 航班数据 | 后缀匹配 | 机场 + 城市名 |
| 存储 | 发现结果 | 直接保存 | Airport 表 |
| 查询 | 数据库 | 条件查询 | 机场列表、城市列表 |

整个流程完全自动化，无需手动配置，支持动态扩展。
