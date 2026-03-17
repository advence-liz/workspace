import { IsOptional, IsString, IsInt, Min } from 'class-validator';

export class UpdateFlightDto {
  @IsOptional()
  @IsString()
  flightNo?: string;

  @IsOptional()
  @IsString()
  origin?: string;

  @IsOptional()
  @IsString()
  destination?: string;

  @IsOptional()
  @IsString()
  departureTime?: string;

  @IsOptional()
  @IsString()
  arrivalTime?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  availableSeats?: number;

  @IsOptional()
  @IsString()
  aircraftType?: string;

  @IsOptional()
  @IsString()
  cardType?: string;
}
