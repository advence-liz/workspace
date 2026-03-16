import { Module } from '@nestjs/common';
import { RouteService } from './route.service';
import { RoundTripService } from './round-trip.service';
import { RouteController } from './route.controller';
import { FlightModule } from '../flight/flight.module';

@Module({
  imports: [FlightModule],
  controllers: [RouteController],
  providers: [RouteService, RoundTripService],
})
export class RouteModule {}
