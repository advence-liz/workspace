import { IsString, IsDateString, IsOptional, IsIn } from 'class-validator';

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
}
