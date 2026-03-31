import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Flight } from './entities/flight.entity';
import { Airport } from './entities/airport.entity';
import { QueryCache } from '../route/entities/query-cache.entity';
import { FlightService } from './flight.service';
import { FlightController } from './flight.controller';
import { AirportService } from './airport.service';
import { AirportController } from './airport.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Flight, Airport, QueryCache])],
  controllers: [FlightController, AirportController],
  providers: [FlightService, AirportService],
  exports: [FlightService, AirportService],
})
export class FlightModule {}
