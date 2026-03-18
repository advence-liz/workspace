import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { RouteService } from './route.service';
import { RoundTripService } from './round-trip.service';
import { PlanRouteDto } from './dto/plan-route.dto';
import { PlanRoundTripDto } from './dto/plan-round-trip.dto';
import { ExploreRouteDto } from './dto/explore-route.dto';

@Controller('routes')
export class RouteController {
  constructor(
    private readonly routeService: RouteService,
    private readonly roundTripService: RoundTripService,
  ) {}

  /**
   * 规划单程路线
   * POST /api/routes/plan
   */
  @Post('plan')
  @HttpCode(HttpStatus.OK)
  async planRoute(@Body() dto: PlanRouteDto) {
    return this.routeService.planRoute(dto);
  }

  /**
   * 规划往返行程（指定目的地）
   * POST /api/routes/round-trip
   */
  @Post('round-trip')
  @HttpCode(HttpStatus.OK)
  async planRoundTrip(@Body() dto: PlanRoundTripDto) {
    return this.roundTripService.planRoundTrip(dto);
  }

  /**
   * 探索模式：发现所有能往返的目的地
   * POST /api/routes/explore
   */
  @Post('explore')
  @HttpCode(HttpStatus.OK)
  async explore(@Body() dto: ExploreRouteDto) {
    return this.roundTripService.exploreDestinations(dto);
  }
}
