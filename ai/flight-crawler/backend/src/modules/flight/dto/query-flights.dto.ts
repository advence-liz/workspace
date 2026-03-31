import { IsString, IsDateString, IsOptional, IsIn, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryFlightsDto {
  @IsString()
  origin: string;

  @IsString()
  @IsOptional()
  destination?: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsString()
  @IsIn(['全部', '666权益卡航班', '2666权益卡航班'])
  @IsOptional()
  flightType?: string = '全部';

  /** 是否包含返程信息，默认 true；传 false 时跳过返程查询，快速返回去程数据 */
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => value === 'false' ? false : value === 'true' ? true : value)
  includeReturn?: boolean = true;
}
