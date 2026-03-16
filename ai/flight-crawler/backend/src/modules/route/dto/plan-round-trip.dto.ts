import { IsString, IsDateString, IsOptional, IsInt, Min, Max, IsBoolean } from 'class-validator';

/**
 * 往返行程规划 DTO
 */
export class PlanRoundTripDto {
  @IsString()
  origin: string;

  @IsString()
  @IsOptional()
  destination?: string; // 不填则自动发现所有往返方案

  @IsDateString()
  departureDate: string; // 出发日期

  @IsDateString()
  returnDate: string; // 返程日期（必填）

  @IsInt()
  @Min(0)
  @Max(3)
  @IsOptional()
  maxTransfers?: number = 0; // 往返默认只考虑直飞（避免组合爆炸）

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

  @IsBoolean()
  @IsOptional()
  autoDiscover?: boolean = false; // 是否自动发现所有往返方案
}
