import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouteService } from './route.service';
import { RoundTripService } from './round-trip.service';
import { RouteController } from './route.controller';
import { FlightModule } from '../flight/flight.module';
import { QueryCache } from './entities/query-cache.entity';

@Module({
  imports: [FlightModule, TypeOrmModule.forFeature([QueryCache])],
  controllers: [RouteController],
  providers: [RouteService, RoundTripService],
  exports: [RouteService],
})
export class RouteModule {}
