import { Injectable, Logger } from '@nestjs/common';
import { FlightService } from '../flight/flight.service';
import { RouteService } from './route.service';
import { PlanRoundTripDto } from './dto/plan-round-trip.dto';
import {
  RoundTripResultDto,
  RoundTripPlanResponseDto,
} from './dto/round-trip-result.dto';
import { RouteResultDto } from './dto/route-result.dto';

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

    // 1. 规划去程
    const outboundRoutes = await this.routeService.planOneWay({
      origin: dto.origin,
      destination: dto.destination!,
      departureDate: dto.departureDate,
      maxTransfers: dto.maxTransfers || 0,
      minLayoverHours: dto.minLayoverHours || 2,
      maxLayoverHours: dto.maxLayoverHours || 24,
    });

    // 2. 规划返程
    const returnRoutes = await this.routeService.planOneWay({
      origin: dto.destination!,
      destination: dto.origin,
      departureDate: dto.returnDate,
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
}
