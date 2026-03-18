import { Controller, Post, Get, Delete, HttpCode, HttpStatus, Body, Query, Param, BadRequestException } from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { InitializeDiscoverDto, InitializeRefreshFlightsDto } from './dto/initialize.dto';
import { QueryLogsDto } from './dto/query-logs.dto';
import { CleanLogsDto } from './dto/clean-logs.dto';

@Controller('crawler')
export class CrawlerController {
  constructor(private readonly crawlerService: CrawlerService) {}

  /**
   * 调试爬虫 - 单次爬取指定城市和日期
   * GET /api/crawler/debug?origin=北京首都&date=2026-03-19
   * 如果不提供 date，则爬取明天的数据
   */
  @Get('debug')
  @HttpCode(HttpStatus.OK)
  async debugPage(@Query('origin') origin?: string, @Query('date') date?: string) {
    const crawlOrigin = origin || '北京';
    const result = await this.crawlerService.debugFlightByDate(crawlOrigin, date);
    return {
      message: result.success ? '调试爬虫完成' : '调试爬虫失败',
      ...result,
    };
  }

  /**
   * 初始化阶段1：发现所有机场
   * POST /api/crawler/initialize/discover
   * Body: { days?: number } // 可选，默认 1 天
   */
  @Post('initialize/discover')
  @HttpCode(HttpStatus.OK)
  async initializeDiscover(@Body() dto: InitializeDiscoverDto) {
    const result = await this.crawlerService.initializeDiscoverAirports(dto.days, dto.planOnly);

    if (dto.planOnly) {
      return {
        message: `执行计划已生成：${result.executionPlan?.totalTasks} 个任务，预计 ${result.executionPlan?.estimatedTime}`,
        ...result,
      };
    }

    return {
      message: result.success
        ? `机场发现完成！发现 ${result.airportCount} 个机场，${result.flightCount} 条航班`
        : '机场发现失败',
      ...result,
    };
  }

  /**
   * 初始化阶段2：发现所有航班数据（按日期区间）
   * POST /api/crawler/initialize/refresh
   * Body: { startDate: string, endDate: string, planOnly?: boolean }
   *
   * 示例：
   * 1. 执行爬虫：{ "startDate": "2026-03-18", "endDate": "2026-03-25" }
   * 2. 仅获取计划：{ "startDate": "2026-03-18", "endDate": "2026-03-25", "planOnly": true }
   */
  @Post('initialize/refresh')
  @HttpCode(HttpStatus.OK)
  async initializeRefresh(@Body() dto: InitializeRefreshFlightsDto) {
    // 验证日期有效性
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('日期格式错误，请使用 YYYY-MM-DD 格式');
    }

    if (start > end) {
      throw new BadRequestException('开始日期不能晚于结束日期');
    }

    const result = await this.crawlerService.initializeRefreshFlightsByDateRange({
      startDate: dto.startDate,
      endDate: dto.endDate,
      planOnly: dto.planOnly,
      async: !dto.planOnly, // 非预览模式时启用异步
    });

    if (dto.planOnly) {
      return {
        message: `执行计划已生成：${result.executionPlan.totalTasks} 个任务，预计 ${result.executionPlan.estimatedTime}`,
        ...result,
      };
    }

    // 异步模式：返回任务 ID
    if (result.taskId) {
      return {
        message: `任务已创建（ID: ${result.taskId}），正在后台执行，请在日志中查看进度`,
        ...result,
      };
    }

    // 同步模式（向后兼容）
    return {
      message: result.success
        ? `航班发现完成！成功 ${result.executionResult?.successTasks} 个任务，失败 ${result.executionResult?.failedTasks} 个，共爬取 ${result.executionResult?.totalCount} 条航班`
        : '航班发现失败',
      ...result,
    };
  }


  /**
   * 强制停止当前运行的爬虫任务（释放锁）
   * POST /api/crawler/stop
   */
  @Post('stop')
  @HttpCode(HttpStatus.OK)
  async stopCrawler() {
    return this.crawlerService.forceStop();
  }

  /**
   * 查询执行日志
   * GET /api/crawler/logs
   */
  @Get('logs')
  @HttpCode(HttpStatus.OK)
  async getLogs(@Query() query: QueryLogsDto) {
    return this.crawlerService.queryLogs(
      query.taskType,
      query.status,
      query.page,
      query.pageSize,
    );
  }

  /**
   * 获取日志详情
   * GET /api/crawler/logs/:id
   */
  @Get('logs/:id')
  @HttpCode(HttpStatus.OK)
  async getLogDetail(@Param('id') id: string) {
    const log = await this.crawlerService.getLogDetail(parseInt(id, 10));
    if (!log) {
      return { message: '日志不存在' };
    }
    return log;
  }

  /**
   * 获取某父任务的子任务日志列表
   * GET /api/crawler/logs/:id/sub-tasks
   */
  @Get('logs/:id/sub-tasks')
  @HttpCode(HttpStatus.OK)
  async getSubLogs(@Param('id') id: string) {
    return this.crawlerService.getSubLogs(parseInt(id, 10));
  }

  /**
   * 获取日志统计信息
   * GET /api/crawler/logs/stats
   */
  @Get('logs-stats')
  @HttpCode(HttpStatus.OK)
  async getLogStats() {
    return this.crawlerService.getLogStats();
  }

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
}
