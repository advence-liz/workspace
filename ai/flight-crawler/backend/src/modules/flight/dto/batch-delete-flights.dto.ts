import { IsArray, ArrayMinSize, IsInt } from 'class-validator';

export class BatchDeleteFlightsDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  ids: number[];
}
