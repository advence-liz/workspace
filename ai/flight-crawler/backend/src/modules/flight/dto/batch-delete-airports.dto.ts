import { IsArray, ArrayMinSize, IsInt } from 'class-validator';

export class BatchDeleteAirportsDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  ids: number[];
}
