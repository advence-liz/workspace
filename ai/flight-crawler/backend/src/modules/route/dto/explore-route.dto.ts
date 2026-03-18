import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export class ExploreRouteDto {
  @IsString()
  @IsNotEmpty()
  origin: string;

  @IsDateString()
  departureDate: string;  // 去程开始日期

  @IsOptional()
  @IsDateString()
  departureDateEnd?: string;  // 去程结束日期（不填则等于 departureDate）

  @IsDateString()
  returnDate: string;  // 返程开始日期

  @IsOptional()
  @IsDateString()
  returnDateEnd?: string;  // 返程结束日期（不填则等于 returnDate）

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2)
  maxTransfers?: number;
}
