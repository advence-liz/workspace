import { IsString, IsDateString, IsOptional, IsInt, Min, Max, IsIn } from 'class-validator';

/**
 * 单程行程规划 DTO
 */
export class PlanRouteDto {
  @IsString()
  origin: string;

  @IsString()
  @IsIn(['666权益卡航班', '2666权益卡航班'])
  @IsOptional()
  flightType?: string; // 不传则显示全部（2666 含全部）

  @IsString()
  @IsOptional()
  destination?: string; // 不填则返回所有直飞航班

  @IsDateString()
  departureDate: string; // 开始日期

  @IsDateString()
  @IsOptional()
  endDate?: string; // 结束日期（日期区间模式）

  @IsInt()
  @Min(0)
  @Max(3)
  @IsOptional()
  maxTransfers?: number = 2;

  @IsInt()
  @Min(1)
  @Max(24)
  @IsOptional()
  minLayoverHours?: number = 2;

  @IsInt()
  @Min(1)
  @Max(48)
  @IsOptional()
  maxLayoverHours?: number = 24;
}
