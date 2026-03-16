import { IsOptional, IsIn, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { CrawlerTaskType, CrawlerTaskStatus } from '../entities/crawler-log.entity';

export class QueryLogsDto {
  @IsOptional()
  @IsIn([
    CrawlerTaskType.DISCOVER_AIRPORTS,
    CrawlerTaskType.REFRESH_FLIGHTS,
    CrawlerTaskType.FULL_INITIALIZE,
  ])
  taskType?: CrawlerTaskType;

  @IsOptional()
  @IsIn([
    CrawlerTaskStatus.RUNNING,
    CrawlerTaskStatus.SUCCESS,
    CrawlerTaskStatus.FAILED,
  ])
  status?: CrawlerTaskStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number = 10;
}
