import { IsInt, IsOptional, Min, Max, IsString, IsBoolean, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export class InitializeDiscoverDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(7)
  days?: number = 1; // 默认 1 天
}

export class InitializeRefreshDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(30)
  days?: number = 7; // 默认 7 天
}

/**
 * 统一的发现航班 DTO
 * 支持两种输入方式：
 * 1. days: 从明天开始的天数（1-30）
 * 2. startDate + endDate: 指定日期区间（YYYY-MM-DD 格式）
 */
export class InitializeRefreshFlightsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(30)
  days?: number;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: '日期格式应为 YYYY-MM-DD' })
  startDate?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: '日期格式应为 YYYY-MM-DD' })
  endDate?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  planOnly?: boolean = false; // true = 仅返回计划，不执行
}
