import { Injectable, Logger } from '@nestjs/common';
import { FlightService } from '../flight/flight.service';
import { RouteService } from './route.service';
import { PlanRoundTripDto } from './dto/plan-round-trip.dto';
import {
  RoundTripResultDto,
  RoundTripPlanResponseDto,
} from './dto/round-trip-result.dto';
import { RouteResultDto } from './dto/route-result.dto';
import { ExploreRouteDto } from './dto/explore-route.dto';
import {
  ExploreDestinationDto,
  ExplorePlanResponseDto,
} from './dto/explore-result.dto';

/**
 * 往返行程规划服务
 * 独立于单程路径规划，避免逻辑耦合
 */
@Injectable()
export class RoundTripService {
  private readonly logger = new Logger(RoundTripService.name);

  constructor(
    private readonly flightService: FlightService,
    private readonly routeService: RouteService,
  ) {}

  /**
   * 规划往返行程
   * - 如果指定目的地：规划指定目的地的往返
   * - 如果不指定目的地：自动发现所有可能的往返方案
   */
  async planRoundTrip(dto: PlanRoundTripDto): Promise<RoundTripPlanResponseDto> {
    if (dto.destination) {
      return this.planSpecificRoundTrip(dto);
    } else {
      return this.planAutoDiscoverRoundTrip(dto);
    }
  }

  /**
   * 规划指定目的地的往返行程
   */
  private async planSpecificRoundTrip(
    dto: PlanRoundTripDto,
  ): Promise<RoundTripPlanResponseDto> {
    this.logger.log(`规划往返行程: ${dto.origin} ⇄ ${dto.destination}`);

    // 1. 规划去程（支持日期范围：范围内任意一天的航班都算）
    const outboundRoutes = await this.routeService.planOneWay({
      origin: dto.origin,
      destination: dto.destination!,
      departureDate: dto.departureDate,
      departureDateEnd: dto.departureDateEnd,
      maxTransfers: dto.maxTransfers || 0,
      minLayoverHours: dto.minLayoverHours || 2,
      maxLayoverHours: dto.maxLayoverHours || 24,
    });

    // 2. 规划返程（支持日期范围）
    const returnRoutes = await this.routeService.planOneWay({
      origin: dto.destination!,
      destination: dto.origin,
      departureDate: dto.returnDate,
      departureDateEnd: dto.returnDateEnd,
      maxTransfers: dto.maxTransfers || 0,
      minLayoverHours: dto.minLayoverHours || 2,
      maxLayoverHours: dto.maxLayoverHours || 24,
    });

    // 3. 组合去程和返程
    const roundTripRoutes: RoundTripResultDto[] = [];

    for (const outbound of outboundRoutes.slice(0, 5)) {
      for (const returnRoute of returnRoutes.slice(0, 5)) {
        const roundTrip = this.combineRoutes(outbound, returnRoute);
        roundTripRoutes.push(roundTrip);
      }
    }

    // 4. 按评分排序
    roundTripRoutes.sort((a, b) => b.score - a.score);

    this.logger.log(`✅ 找到 ${roundTripRoutes.length} 个往返方案`);

    return {
      routes: roundTripRoutes.slice(0, 10),
      searchParams: {
        origin: dto.origin,
        destination: dto.destination,
        departureDate: dto.departureDate,
        returnDate: dto.returnDate,
        maxTransfers: dto.maxTransfers || 0,
        autoDiscover: false,
      },
    };
  }

  /**
   * 自动发现所有往返方案
   */
  private async planAutoDiscoverRoundTrip(
    dto: PlanRoundTripDto,
  ): Promise<RoundTripPlanResponseDto> {
    this.logger.log(
      `自动发现往返: ${dto.origin}，${dto.departureDate} 去，${dto.returnDate} 回`,
    );

    // 1. 查询去程所有航班
    const outboundFlights = await this.flightService.queryFlights({
      origin: dto.origin,
      startDate: dto.departureDate,
      endDate: dto.departureDate,
    });

    // 2. 提取所有可达目的地
    const destinations = new Set<string>();
    outboundFlights.forEach((flight) => {
      if (flight.destination && flight.destination !== dto.origin) {
        destinations.add(flight.destination);
      }
    });

    this.logger.log(`发现 ${destinations.size} 个可达目的地`);

    // 3. 并行规划所有目的地的往返方案（性能优化）
    const allPromises = Array.from(destinations).map((destination) =>
      this.planSpecificRoundTrip({
        ...dto,
        destination,
      }).catch((error) => {
        this.logger.warn(`${dto.origin} ⇄ ${destination} 规划失败`, error);
        return null;
      }),
    );

    const results = await Promise.all(allPromises);

    // 4. 汇总所有往返方案
    const allRoundTripRoutes: RoundTripResultDto[] = [];
    results.forEach((result) => {
      if (result && result.routes) {
        allRoundTripRoutes.push(...result.routes);
      }
    });

    // 5. 按评分排序，返回 Top 20
    allRoundTripRoutes.sort((a, b) => b.score - a.score);

    this.logger.log(
      `✅ 自动发现完成，共 ${allRoundTripRoutes.length} 个方案，返回 Top 20`,
    );

    return {
      routes: allRoundTripRoutes.slice(0, 20),
      searchParams: {
        origin: dto.origin,
        destination: dto.destination,
        departureDate: dto.departureDate,
        returnDate: dto.returnDate,
        maxTransfers: dto.maxTransfers || 0,
        autoDiscover: true,
      },
    };
  }

  /**
   * 组合去程和返程，生成往返方案
   */
  private combineRoutes(
    outbound: RouteResultDto,
    returnRoute: RouteResultDto,
  ): RoundTripResultDto {
    const totalDuration = outbound.totalDuration + returnRoute.totalDuration;
    const totalTransferCount = outbound.transferCount + returnRoute.transferCount;

    // 计算综合评分
    const score = this.calculateRoundTripScore(
      totalDuration,
      totalTransferCount,
    );

    return {
      outbound: {
        segments: outbound.segments,
        totalDuration: outbound.totalDuration,
        transferCount: outbound.transferCount,
        layovers: outbound.layovers,
      },
      return: {
        segments: returnRoute.segments,
        totalDuration: returnRoute.totalDuration,
        transferCount: returnRoute.transferCount,
        layovers: returnRoute.layovers,
      },
      totalDuration,
      totalTransferCount,
      score,
    };
  }

  /**
   * 计算往返行程评分
   * 评分机制：时长权重 70%，中转权重 30%
   */
  private calculateRoundTripScore(
    totalDuration: number,
    totalTransferCount: number,
  ): number {
    // 时长评分（越短越好）- 假设最长 24 小时
    const durationScore =
      Math.max(0, (24 * 60 - totalDuration) / (24 * 60)) * 70;

    // 中转评分（越少越好）- 最多 3 次中转
    const transferScore = Math.max(0, (3 - totalTransferCount) / 3) * 30;

    return durationScore + transferScore;
  }

  /**
   * 探索模式：发现所有能往返的目的地
   * 返回按目的地分组的结果，每个目的地包含最优去程和最优返程
   */
  async exploreDestinations(dto: ExploreRouteDto): Promise<ExplorePlanResponseDto> {
    this.logger.log(
      `探索往返目的地: ${dto.origin}，${dto.departureDate} 去，${dto.returnDate} 回`,
    );

    const maxTransfers = dto.maxTransfers ?? 0;

    // 去程/返程的日期范围（不填结束日期则等于开始日期）
    const departureDateEnd = dto.departureDateEnd || dto.departureDate;
    const returnDateEnd = dto.returnDateEnd || dto.returnDate;

    // 1. 查询出发地所有去程航班（日期范围内）
    const outboundFlights = await this.flightService.queryFlights({
      origin: dto.origin,
      startDate: dto.departureDate,
      endDate: departureDateEnd,
    });

    // 2. 提取所有可达目的地（直飞）
    const destinations = new Set<string>();
    outboundFlights.forEach((flight) => {
      if (flight.destination && flight.destination !== dto.origin) {
        destinations.add(flight.destination);
      }
    });

    this.logger.log(`发现 ${destinations.size} 个可达目的地，开始并行规划往返`);

    // 3. 并行规划每个目的地的去程和返程（均使用日期范围）
    const allPromises = Array.from(destinations).map(async (city) => {
      try {
        const outboundRoutes = await this.routeService.planOneWay({
          origin: dto.origin,
          destination: city,
          departureDate: dto.departureDate,
          departureDateEnd,
          maxTransfers,
          minLayoverHours: 2,
          maxLayoverHours: 24,
        });

        const returnRoutes = await this.routeService.planOneWay({
          origin: city,
          destination: dto.origin,
          departureDate: dto.returnDate,
          departureDateEnd: returnDateEnd,
          maxTransfers,
          minLayoverHours: 2,
          maxLayoverHours: 24,
        });

        // 必须去程和返程都有方案才算可往返
        if (outboundRoutes.length === 0 || returnRoutes.length === 0) {
          return null;
        }

        const bestOutbound = outboundRoutes[0];
        const bestReturn = returnRoutes[0];
        const totalDuration = bestOutbound.totalDuration + bestReturn.totalDuration;
        const totalTransfers = bestOutbound.transferCount + bestReturn.transferCount;
        const score = this.calculateRoundTripScore(totalDuration, totalTransfers);

        const result: ExploreDestinationDto = {
          city,
          bestOutbound,
          bestReturn,
          outboundCount: outboundRoutes.length,
          returnCount: returnRoutes.length,
          score,
        };
        return result;
      } catch (error) {
        this.logger.warn(`探索 ${dto.origin} ⇄ ${city} 失败`, error);
        return null;
      }
    });

    const results = await Promise.all(allPromises);

    // 4. 过滤掉失败的，按综合评分排序，最多返回 30 个
    const destinations_result = results
      .filter((r): r is ExploreDestinationDto => r !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, 30);

    this.logger.log(`✅ 探索完成，找到 ${destinations_result.length} 个可往返目的地`);

    return {
      destinations: destinations_result,
      searchParams: {
        origin: dto.origin,
        departureDate: dto.departureDate,
        returnDate: dto.returnDate,
        maxTransfers,
      },
    };
  }
}
