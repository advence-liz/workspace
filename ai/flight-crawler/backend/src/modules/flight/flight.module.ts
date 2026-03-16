import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Flight } from './entities/flight.entity';
import { Airport } from './entities/airport.entity';
import { FlightService } from './flight.service';
import { FlightController } from './flight.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Flight, Airport])],
  controllers: [FlightController],
  providers: [FlightService],
  exports: [FlightService],
})
export class FlightModule {}
