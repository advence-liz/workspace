import { IsInt, IsOptional, Min, Max, IsString, IsBoolean, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export class InitializeDiscoverDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(7)
  days?: number = 1; // 默认 1 天

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  planOnly?: boolean = false; // true = 仅返回计划，不执行
}

/**
 * 发现航班 DTO - 按日期区间查询
 * 必须同时指定 startDate 和 endDate（YYYY-MM-DD 格式）
 */
export class InitializeRefreshFlightsDto {
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: '日期格式应为 YYYY-MM-DD' })
  startDate: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: '日期格式应为 YYYY-MM-DD' })
  endDate: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  planOnly?: boolean = false; // true = 仅返回计划，不执行
}
