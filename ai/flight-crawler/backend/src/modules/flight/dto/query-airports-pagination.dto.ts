import { IsOptional, IsInt, Min, IsString, IsIn, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { Transform } from 'class-transformer';

export class QueryAirportsWithPaginationDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  pageSize?: number = 10;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  enableCrawl?: boolean;

  @IsOptional()
  @IsIn(['name', 'city', 'discoveredAt', 'updatedAt'])
  sortBy?: 'name' | 'city' | 'discoveredAt' | 'updatedAt';

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';
}
