import { Controller, Post, Get, Delete, HttpCode, HttpStatus, Body, Query, Param } from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { InitializeDiscoverDto, InitializeRefreshDto } from './dto/initialize.dto';
import { QueryLogsDto } from './dto/query-logs.dto';
import { CleanLogsDto } from './dto/clean-logs.dto';

@Controller('crawler')
export class CrawlerController {
  constructor(private readonly crawlerService: CrawlerService) {}

  /**
   * 手动触发爬虫
   * POST /api/crawler/trigger
   */
  @Post('trigger')
  @HttpCode(HttpStatus.OK)
  async triggerCrawl() {
    const result = await this.crawlerService.triggerCrawl();
    return {
      message: result.success ? '爬虫任务已启动' : '爬虫任务失败',
      ...result,
    };
  }

  /**
   * 调试爬虫 - 单次爬取指定城市（默认北京）
   * GET /api/crawler/debug?origin=北京
   */
  @Get('debug')
  @HttpCode(HttpStatus.OK)
  async debugPage() {
    const result = await this.crawlerService.debugPageStructure('北京');
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
    const result = await this.crawlerService.initializeDiscoverAirports(dto.days);
    return {
      message: result.success
        ? `机场发现完成！发现 ${result.airportCount} 个机场，${result.flightCount} 条航班`
        : '机场发现失败',
      ...result,
    };
  }

  /**
   * 初始化阶段2：发现所有航班数据
   * POST /api/crawler/initialize/refresh
   * Body: { days?: number } // 可选，默认 7 天
   */
  @Post('initialize/refresh')
  @HttpCode(HttpStatus.OK)
  async initializeRefresh(@Body() dto: InitializeRefreshDto) {
    const result = await this.crawlerService.initializeRefreshFlights(dto.days);
    return {
      message: result.success
        ? `航班发现完成！共爬取 ${result.count} 条航班`
        : '航班发现失败',
      ...result,
    };
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
