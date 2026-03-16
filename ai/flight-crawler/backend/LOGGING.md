# Winston 日志配置说明

## 📦 已安装的包

```json
{
  "winston": "^3.x",
  "nest-winston": "^1.x",
  "winston-daily-rotate-file": "^5.x"
}
```

## 📝 日志文件位置

```
backend/logs/
├── app-2026-03-16.log       # 应用日志（INFO 及以上）
├── error-2026-03-16.log     # 错误日志（ERROR）
├── debug-2026-03-16.log     # 调试日志（DEBUG 及以上，仅开发环境）
└── README.md                # 日志说明
```

## 🎯 日志级别

| 级别 | 用途 | 示例 |
|------|------|------|
| **ERROR** | 错误和异常 | 爬虫失败、数据库错误 |
| **WARN** | 警告信息 | 权益卡选择失败、API 超时 |
| **INFO** | 一般信息 | 爬虫开始、数据保存成功 |
| **DEBUG** | 调试信息 | 页面元素分析、API 响应详情 |

## 📊 日志保留策略

| 文件类型 | 单文件大小 | 保留时间 | 压缩 |
|---------|-----------|---------|------|
| app-*.log | 20MB | 14 天 | ✅ |
| error-*.log | 20MB | 30 天 | ✅ |
| debug-*.log | 20MB | 7 天 | ✅ |

## 🔧 配置文件

### 1. `src/config/logger.config.ts`
Winston 配置，定义日志格式、输出目标、轮转策略。

### 2. `src/app.module.ts`
导入 WinstonModule，使其在整个应用中可用。

### 3. `src/main.ts`
将 Winston 设置为全局日志记录器。

## 📖 使用方法

### 在 Service 中使用

```typescript
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MyService {
  private readonly logger = new Logger(MyService.name);

  doSomething() {
    this.logger.log('这是 INFO 日志');
    this.logger.debug('这是 DEBUG 日志');
    this.logger.warn('这是 WARN 日志');
    this.logger.error('这是 ERROR 日志');
  }
}
```

### 查看日志

```bash
# 实时查看应用日志
tail -f logs/app-$(date +%Y-%m-%d).log

# 实时查看错误日志
tail -f logs/error-$(date +%Y-%m-%d).log

# 实时查看调试日志（开发环境）
tail -f logs/debug-$(date +%Y-%m-%d).log

# 搜索关键词
grep "爬虫" logs/app-*.log

# 查看最近 100 行
tail -100 logs/app-$(date +%Y-%m-%d).log
```

## 🎨 日志格式

### 文件日志格式
```
2026-03-16 15:30:45 [INFO] [CrawlerService] 开始爬取航班数据: 北京
2026-03-16 15:30:50 [DEBUG] [CrawlerService] 📸 初始截图: /path/to/screenshot.png
2026-03-16 15:31:00 [ERROR] [CrawlerService] ❌ 爬取失败: Timeout
```

### 控制台日志格式（带颜色）
```bash
2026-03-16 15:30:45 INFO [CrawlerService] 开始爬取航班数据: 北京
2026-03-16 15:30:50 DEBUG [CrawlerService] 📸 初始截图: /path/to/screenshot.png
2026-03-16 15:31:00 ERROR [CrawlerService] ❌ 爬取失败: Timeout
```

## 🌍 环境配置

### 开发环境（默认）
- 控制台输出：DEBUG 级别
- 文件输出：INFO + ERROR + DEBUG

### 生产环境（NODE_ENV=production）
- 控制台输出：INFO 级别
- 文件输出：INFO + ERROR（无 DEBUG）

设置生产环境：
```bash
export NODE_ENV=production
npm run start:prod
```

## 🔍 日志分析示例

### 查看今天的爬虫日志
```bash
grep "爬取" logs/app-$(date +%Y-%m-%d).log
```

### 查看所有错误
```bash
cat logs/error-*.log
```

### 统计错误次数
```bash
grep -c "ERROR" logs/app-$(date +%Y-%m-%d).log
```

### 查看特定时间段的日志
```bash
awk '/15:30:00/,/15:35:00/' logs/app-2026-03-16.log
```

## 📌 注意事项

1. **日志目录已添加到 .gitignore**，不会提交到 Git
2. **旧日志自动压缩**为 `.gz` 格式，节省空间
3. **超期日志自动删除**，无需手动清理
4. **控制台和文件同时输出**，开发和生产都方便
5. **日志包含上下文信息**（Service 名称），便于追踪

## 🚀 快速开始

1. 启动应用：
```bash
npm run dev
```

2. 查看日志：
```bash
tail -f logs/app-$(date +%Y-%m-%d).log
```

3. 测试爬虫并查看日志：
```bash
curl http://localhost:3000/api/crawler/debug
tail -50 logs/debug-$(date +%Y-%m-%d).log
```

## 🎯 爬虫相关日志

爬虫执行时会输出详细日志，包括：
- 页面访问状态
- 元素选择过程
- 截图保存路径
- API 响应捕获
- 数据提取结果
- 错误和警告信息

所有这些日志都会同时输出到：
- **控制台**：实时查看
- **日志文件**：持久化存储，便于事后分析
