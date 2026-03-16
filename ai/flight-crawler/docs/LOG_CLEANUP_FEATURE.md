# 日志清理功能说明

## 🎯 功能概述

为执行日志添加了主动清理功能，支持清理旧日志和清空所有日志，帮助管理数据库存储空间。

---

## ✨ 核心功能

### 1. 清理旧日志 ✅

**功能**：
- 清理指定天数之前的日志记录
- 默认保留最近 90 天的日志
- 可自定义保留天数（1-365 天）

**使用场景**：
- 定期清理历史日志，释放存储空间
- 保留最近的日志用于问题排查
- 避免数据库文件过大

### 2. 清理所有日志 ✅

**功能**：
- 删除所有日志记录
- 危险操作，需二次确认

**使用场景**：
- 重置日志系统
- 测试环境清理数据
- 生产环境迁移前清理

---

## 📦 技术实现

### 后端实现

#### 1. Service 方法

**文件**: `backend/src/modules/crawler/crawler.service.ts`

```typescript
/**
 * 清理旧日志
 * @param days 保留最近多少天的日志（默认 90 天）
 * @returns 删除的日志数量
 */
async cleanOldLogs(days: number = 90): Promise<{ deletedCount: number }> {
  this.logger.log(`开始清理 ${days} 天前的日志`);

  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    cutoffDate.setHours(0, 0, 0, 0);

    const result = await this.crawlerLogRepository
      .createQueryBuilder()
      .delete()
      .where('createdAt < :cutoffDate', { cutoffDate })
      .execute();

    const deletedCount = result.affected || 0;
    this.logger.log(`✅ 清理完成，删除了 ${deletedCount} 条日志`);

    return { deletedCount };
  } catch (error) {
    this.logger.error('清理日志失败', error);
    throw error;
  }
}

/**
 * 清理所有日志（危险操作）
 * @returns 删除的日志数量
 */
async cleanAllLogs(): Promise<{ deletedCount: number }> {
  this.logger.warn('⚠️ 开始清理所有日志');

  try {
    const result = await this.crawlerLogRepository
      .createQueryBuilder()
      .delete()
      .execute();

    const deletedCount = result.affected || 0;
    this.logger.log(`✅ 清理完成，删除了 ${deletedCount} 条日志`);

    return { deletedCount };
  } catch (error) {
    this.logger.error('清理日志失败', error);
    throw error;
  }
}
```

#### 2. DTO 验证

**文件**: `backend/src/modules/crawler/dto/clean-logs.dto.ts`

```typescript
import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CleanLogsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '天数必须是整数' })
  @Min(1, { message: '至少保留 1 天的日志' })
  @Max(365, { message: '最多保留 365 天的日志' })
  days?: number = 90;
}
```

#### 3. Controller 接口

**文件**: `backend/src/modules/crawler/crawler.controller.ts`

```typescript
/**
 * 清理旧日志
 * DELETE /api/crawler/logs/clean
 * Body: { days?: number } // 保留最近多少天的日志，默认 90 天
 */
@Delete('logs/clean')
@HttpCode(HttpStatus.OK)
async cleanOldLogs(@Body() dto: CleanLogsDto) {
  const result = await this.crawlerService.cleanOldLogs(dto.days);
  return {
    message: `成功清理 ${result.deletedCount} 条日志`,
    ...result,
  };
}

/**
 * 清理所有日志（危险操作）
 * DELETE /api/crawler/logs/clean-all
 */
@Delete('logs/clean-all')
@HttpCode(HttpStatus.OK)
async cleanAllLogs() {
  const result = await this.crawlerService.cleanAllLogs();
  return {
    message: `成功清理 ${result.deletedCount} 条日志`,
    ...result,
  };
}
```

### 前端实现

#### 1. API 封装

**文件**: `frontend/src/api/flight.ts`

```typescript
// 清理日志
export const cleanOldLogs = (days?: number): Promise<{ deletedCount: number; message: string }> => {
  return api.delete('/crawler/logs/clean', { data: { days } });
};

export const cleanAllLogs = (): Promise<{ deletedCount: number; message: string }> => {
  return api.delete('/crawler/logs/clean-all');
};
```

#### 2. 页面集成

**文件**: `frontend/src/pages/DataManagement.tsx`

**清理旧日志**：
```typescript
const handleCleanOldLogs = () => {
  Modal.confirm({
    title: '清理旧日志',
    icon: <ExclamationCircleOutlined />,
    content: (
      <div>
        <p>将清理 90 天前的日志记录。</p>
        <p style={{ color: '#ff4d4f' }}>此操作不可恢复，请确认！</p>
      </div>
    ),
    okText: '确认清理',
    okType: 'danger',
    cancelText: '取消',
    onOk: async () => {
      try {
        const result = await cleanOldLogs(90);
        message.success(result.message);
        loadLogs(logsPagination.current, logsPagination.pageSize);
        loadLogStats();
      } catch (error) {
        message.error('清理失败');
        console.error(error);
      }
    },
  });
};
```

**清理所有日志**：
```typescript
const handleCleanAllLogs = () => {
  Modal.confirm({
    title: '清理所有日志',
    icon: <ExclamationCircleOutlined />,
    content: (
      <div>
        <p style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
          ⚠️ 危险操作！将删除所有日志记录！
        </p>
        <p>此操作不可恢复，请谨慎操作！</p>
      </div>
    ),
    okText: '确认清理',
    okType: 'danger',
    cancelText: '取消',
    onOk: async () => {
      try {
        const result = await cleanAllLogs();
        message.success(result.message);
        loadLogs(1, logsPagination.pageSize);
        loadLogStats();
      } catch (error) {
        message.error('清理失败');
        console.error(error);
      }
    },
  });
};
```

**按钮位置**：
```tsx
<Card
  title={
    <Space>
      <HistoryOutlined />
      执行日志
    </Space>
  }
  extra={
    <Space size="large">
      {/* 统计信息 */}
      {logStats && (
        <Space size="large">
          <Statistic title="总执行次数" value={logStats.total} />
          <Statistic title="成功" value={logStats.successCount} />
          <Statistic title="失败" value={logStats.failedCount} />
          <Statistic title="今日执行" value={logStats.todayCount} />
        </Space>
      )}
      {/* 清理按钮 */}
      <Button icon={<DeleteOutlined />} onClick={handleCleanOldLogs}>
        清理旧日志
      </Button>
      <Button danger icon={<DeleteOutlined />} onClick={handleCleanAllLogs}>
        清理所有
      </Button>
    </Space>
  }
>
  {/* 日志表格 */}
</Card>
```

---

## 🔍 使用示例

### 1. 清理 90 天前的日志

**API 请求**：
```bash
curl -X DELETE http://localhost:3000/api/crawler/logs/clean \
  -H "Content-Type: application/json" \
  -d '{"days": 90}'
```

**响应**：
```json
{
  "message": "成功清理 150 条日志",
  "deletedCount": 150
}
```

### 2. 清理 30 天前的日志

**API 请求**：
```bash
curl -X DELETE http://localhost:3000/api/crawler/logs/clean \
  -H "Content-Type: application/json" \
  -d '{"days": 30}'
```

### 3. 清理所有日志

**API 请求**：
```bash
curl -X DELETE http://localhost:3000/api/crawler/logs/clean-all
```

**响应**：
```json
{
  "message": "成功清理 500 条日志",
  "deletedCount": 500
}
```

---

## 💡 使用场景

### 场景 1：定期维护

**需求**：每月清理一次旧日志，保留最近 3 个月的数据

**操作**：
1. 访问数据管理页面
2. 滚动到"执行日志"卡片
3. 点击"清理旧日志"按钮
4. 确认清理

**效果**：
- 删除 90 天前的日志
- 释放数据库存储空间
- 保留最近的日志用于问题排查

### 场景 2：存储空间不足

**需求**：数据库文件过大，需要立即清理

**操作**：
1. 先尝试清理旧日志（90 天前）
2. 如果空间仍不足，清理更多天数的日志
3. 最后考虑清理所有日志（生产环境慎用）

### 场景 3：测试环境重置

**需求**：测试完成后清理所有测试数据

**操作**：
1. 访问数据管理页面
2. 点击"清理所有"按钮
3. 二次确认后清空所有日志

---

## ⚠️ 注意事项

### 1. 不可恢复

- ⚠️ 清理操作**不可恢复**
- 删除的日志无法找回
- 操作前请确认是否需要备份

### 2. 二次确认

- 前端提供 Modal 确认弹窗
- 清理所有日志有特别警告提示
- 防止误操作

### 3. 建议清理策略

**开发环境**：
- 可以随时清理
- 建议保留最近 30 天

**生产环境**：
- 建议定期清理（每月或每季度）
- 保留最近 90-180 天
- 清理前备份数据库

### 4. 自动清理

目前是手动清理，后续可以考虑：
- 添加定时任务自动清理
- 设置日志保留策略
- 自动归档历史日志

---

## 📋 文件变更清单

### 后端文件（3 个）

- ✅ `backend/src/modules/crawler/crawler.service.ts` - 添加清理方法
- ✅ `backend/src/modules/crawler/crawler.controller.ts` - 添加清理接口
- ✅ `backend/src/modules/crawler/dto/clean-logs.dto.ts` - 新增 DTO

### 前端文件（2 个）

- ✅ `frontend/src/api/flight.ts` - 添加清理 API
- ✅ `frontend/src/pages/DataManagement.tsx` - 添加清理按钮

### 文档文件（1 个）

- ✅ `docs/LOG_CLEANUP_FEATURE.md` - 本文档

---

## 🚀 后续优化建议

### 1. 自动清理

- 添加定时任务（如每月 1 号自动清理）
- 可配置保留天数
- 清理后发送通知

### 2. 日志归档

- 清理前自动归档到文件
- 压缩存储历史日志
- 支持导出为 CSV

### 3. 批量操作

- 支持按任务类型清理
- 支持按状态清理（如只清理成功的日志）
- 支持按日期范围清理

### 4. 存储监控

- 显示数据库文件大小
- 显示日志占用空间
- 提供清理建议

---

## ✨ 总结

日志清理功能为系统提供了存储空间管理能力：

- 🗑️ **手动清理**：支持清理旧日志和清空所有日志
- 🔒 **安全机制**：二次确认，防止误操作
- 📊 **实时反馈**：显示删除的日志数量
- 🔄 **自动刷新**：清理后自动刷新日志列表和统计信息

现在您可以：
- 定期清理旧日志，释放存储空间
- 管理数据库大小
- 保持系统高效运行

---

**开发者**: Claude
**版本**: v1.4.0
**日期**: 2026-03-16
