import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateAirportDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsBoolean()
  enableCrawl?: boolean;
}
