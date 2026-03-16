import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 清理日志 DTO
 */
export class CleanLogsDto {
  /**
   * 保留最近多少天的日志
   * @example 90
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '天数必须是整数' })
  @Min(1, { message: '至少保留 1 天的日志' })
  @Max(365, { message: '最多保留 365 天的日志' })
  days?: number = 90;
}
