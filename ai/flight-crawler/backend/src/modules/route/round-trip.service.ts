import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
import { QueryCache } from './entities/query-cache.entity';

// 探索查询缓存 TTL：6 小时
const EXPLORE_CACHE_TTL_MS = process.env.DISABLE_CACHE === 'true' ? 0 : 6 * 60 * 60 * 1000;

async function pLimit<T>(tasks: (() => Promise<T>)[], limit: number): Promise<T[]> {
  const results: T[] = [];
  let i = 0;
  const run = async (): Promise<void> => {
    while (i < tasks.length) {
      const idx = i++;
      results[idx] = await tasks[idx]();
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, run));
  return results;
}

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
    @InjectRepository(QueryCache)
    private readonly queryCacheRepository: Repository<QueryCache>,
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

    // 3. 并行规划所有目的地的往返方案（pLimit 限制并发，避免数据库连接耗尽）
    const destList = Array.from(destinations);
    const results = await pLimit(
      destList.map(destination => () =>
        this.planSpecificRoundTrip({ ...dto, destination }).catch((error) => {
          this.logger.warn(`${dto.origin} ⇄ ${destination} 规划失败`, error);
          return null;
        }),
      ), 10);

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

    // 检查 DB 缓存
    const cacheKey = `explore|${dto.origin}|${dto.departureDate}|${departureDateEnd}|${dto.returnDate}|${returnDateEnd}|${maxTransfers}`;
    const cached = await this.queryCacheRepository.findOne({ where: { cacheKey } });
    if (cached && cached.expireAt > new Date()) {
      this.logger.log(`探索查询命中缓存: ${cacheKey}`);
      return JSON.parse(cached.data);
    }

    // 1. 全量加载去程/返程日期范围内所有航班（1次SQL替代N+1）
    const originAirports = await this.flightService.expandCityToAirports(dto.origin);
    const originSet = new Set(originAirports);

    const [outboundAllFlights, returnAllFlights] = await Promise.all([
      this.flightService.queryAllFlightsInRange(dto.departureDate, departureDateEnd, dto.flightType),
      this.flightService.queryAllFlightsInRange(dto.returnDate, returnDateEnd, dto.flightType),
    ]);

    // 2. 内存建去程图（出发机场 + 一跳可达城市）
    const outboundFirstHop = new Set<string>();
    for (const f of outboundAllFlights) {
      if (originAirports.includes(f.origin)) outboundFirstHop.add(f.destination);
    }
    const outboundFiltered = outboundAllFlights.filter(f =>
      originAirports.includes(f.origin) || outboundFirstHop.has(f.origin),
    );
    const outboundGraph = this.routeService.buildGraphPublic(outboundFiltered);

    // 3. 一次DFS得到所有目的地的去程路径
    const outboundByDest = this.routeService.findAllRoutesGroupedByDestPublic(
      outboundGraph, originAirports, originSet, maxTransfers, 2, 24,
    );

    const candidateCities = Array.from(outboundByDest.keys());
    this.logger.log(`发现 ${candidateCities.length} 个可达目的地，开始返程搜索`);

    // 4. 内存建返程图（候选目的地 + 一跳可达城市）
    const returnFirstHop = new Set<string>(candidateCities);
    for (const f of returnAllFlights) {
      if (candidateCities.includes(f.origin)) returnFirstHop.add(f.destination);
    }
    const returnFiltered = returnAllFlights.filter(f =>
      candidateCities.includes(f.origin) || (returnFirstHop.has(f.origin) && !originAirports.includes(f.origin)),
    );
    const returnGraph = this.routeService.buildGraphPublic(returnFiltered);

    // 5. 一次DFS得到所有能回到出发城市的返程路径，按出发城市分组
    const returnByDest = this.routeService.findAllRoutesGroupedByDestPublic(
      returnGraph, candidateCities, new Set(candidateCities), maxTransfers, 2, 24,
    );
    const returnBySrc = new Map<string, RouteResultDto[]>();
    for (const [dest, routes] of returnByDest) {
      if (originAirports.includes(dest)) {
        for (const route of routes) {
          const src = route.segments[0].origin;
          if (!returnBySrc.has(src)) returnBySrc.set(src, []);
          returnBySrc.get(src)!.push(route);
        }
      }
    }

    // 6. 按目的地汇总，计算评分
    const destinations_result: ExploreDestinationDto[] = [];
    for (const city of candidateCities) {
      const outboundRoutes = outboundByDest.get(city) ?? [];
      const returnRoutes = returnBySrc.get(city) ?? [];
      if (outboundRoutes.length === 0 || returnRoutes.length === 0) continue;

      const scoredOut = outboundRoutes.map(r => this.routeService.calculateScorePublic(r)).sort((a, b) => b.score - a.score);
      const scoredRet = returnRoutes.map(r => this.routeService.calculateScorePublic(r)).sort((a, b) => b.score - a.score);
      const bestOutbound = scoredOut[0];
      const bestReturn = scoredRet[0];
      const score = this.calculateRoundTripScore(
        bestOutbound.totalDuration + bestReturn.totalDuration,
        bestOutbound.transferCount + bestReturn.transferCount,
      );
      destinations_result.push({ city, bestOutbound, bestReturn, outboundCount: scoredOut.length, returnCount: scoredRet.length, score });
    }

    destinations_result.sort((a, b) => b.score - a.score);
    const top30 = destinations_result.slice(0, 30);

    this.logger.log(`✅ 探索完成，找到 ${top30.length} 个可往返目的地`);

    const result: ExplorePlanResponseDto = {
      destinations: top30,
      searchParams: {
        origin: dto.origin,
        departureDate: dto.departureDate,
        returnDate: dto.returnDate,
        maxTransfers,
      },
    };

    // 写入 DB 缓存
    const expireAt = new Date(Date.now() + EXPLORE_CACHE_TTL_MS);
    await this.queryCacheRepository.save({
      cacheKey,
      data: JSON.stringify(result),
      expireAt,
      createdAt: new Date(),
    });
    this.logger.log(`探索结果已缓存，TTL 6h: ${cacheKey}`);

    return result;
  }
}
