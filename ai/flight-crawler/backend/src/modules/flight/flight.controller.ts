import { Controller, Get, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { FlightService } from './flight.service';
import { QueryFlightsDto } from './dto/query-flights.dto';

@Controller('flights')
export class FlightController {
  constructor(private readonly flightService: FlightService) {}

  /**
   * 查询所有可达目的地
   * GET /api/flights/destinations
   */
  @Get('destinations')
  @HttpCode(HttpStatus.OK)
  async getDestinations(@Query() query: QueryFlightsDto) {
    return this.flightService.queryDestinations(query);
  }

  /**
   * 查询航班列表
   * GET /api/flights
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getFlights(@Query() query: QueryFlightsDto) {
    return this.flightService.queryFlights(query);
  }

  /**
   * 获取所有可用的城市列表（出发地和目的地）
   * GET /api/flights/cities
   */
  @Get('cities')
  @HttpCode(HttpStatus.OK)
  async getAvailableCities() {
    return this.flightService.getAvailableCities();
  }

  /**
   * 查询往返航班详情
   * GET /api/flights/round-trip
   */
  @Get('round-trip')
  @HttpCode(HttpStatus.OK)
  async getRoundTripFlights(@Query() query: QueryFlightsDto) {
    return this.flightService.queryRoundTripFlights(query);
  }
}
