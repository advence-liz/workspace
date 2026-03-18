import { Injectable, Logger } from '@nestjs/common';
import { FlightService } from '../flight/flight.service';
import { PlanRouteDto } from './dto/plan-route.dto';
import {
  RouteResultDto,
  RoutePlanResponseDto,
  FlightSegmentDto,
} from './dto/route-result.dto';
import { Flight } from '../flight/entities/flight.entity';

interface GraphNode {
  city: string;
  flights: Flight[];
}

@Injectable()
export class RouteService {
  private readonly logger = new Logger(RouteService.name);

  constructor(private readonly flightService: FlightService) {}

  /**
   * 规划单程路线（对外接口）
   * - 如果提供 endDate：查询日期区间内的航班
   * - 如果不提供目的地：返回所有直飞航班
   * - 如果提供目的地：使用 DFS 搜索最优路径
   */
  async planRoute(dto: PlanRouteDto): Promise<RoutePlanResponseDto> {
    const isDateRange = !!dto.endDate;

    this.logger.log(`开始规划单程路线: ${dto.origin} -> ${dto.destination || '所有目的地'}`);
    if (isDateRange) {
      this.logger.log(`日期区间: ${dto.departureDate} ~ ${dto.endDate}`);
    }

    // 1. 获取所有相关航班（支持日期区间）
    const allFlights = await this.getAllRelevantFlights(dto);

    // 如果目的地为空，直接返回所有航班
    if (!dto.destination) {
      this.logger.log(`目的地为空，返回所有 ${allFlights.length} 条航班`);
      const directRoutes = allFlights.map(flight => this.buildRouteResult([flight]));
      return {
        routes: directRoutes,
        searchParams: {
          origin: dto.origin,
          destination: dto.destination,
          departureDate: dto.departureDate,
          endDate: dto.endDate,
          maxTransfers: dto.maxTransfers || 2,
        },
      };
    }

    // 2. 构建图
    const graph = this.buildGraph(allFlights);

    // 3. 使用 DFS 查找所有可行路径
    const routes = this.findAllRoutes(
      graph,
      dto.origin,
      dto.destination,
      dto.maxTransfers || 2,
      dto.minLayoverHours || 2,
      dto.maxLayoverHours || 24,
    );

    // 4. 计算评分并排序
    const scoredRoutes = routes.map((route) => this.calculateScore(route));
    scoredRoutes.sort((a, b) => b.score - a.score);

    // 5. 返回 Top 10
    return {
      routes: scoredRoutes.slice(0, 10),
      searchParams: {
        origin: dto.origin,
        destination: dto.destination,
        departureDate: dto.departureDate,
        endDate: dto.endDate,
        maxTransfers: dto.maxTransfers || 2,
      },
    };
  }

  /**
   * 规划单程路线（内部方法，供 RoundTripService 调用）
   * 返回所有可行路径的评分结果
   */
  async planOneWay(params: {
    origin: string;
    destination: string;
    departureDate: string;
    departureDateEnd?: string;  // 不填则等于 departureDate（向后兼容）
    maxTransfers?: number;
    minLayoverHours?: number;
    maxLayoverHours?: number;
  }): Promise<RouteResultDto[]> {
    const endDate = params.departureDateEnd || params.departureDate;
    const flights = await this.flightService.queryFlights({
      origin: params.origin,
      destination: params.destination,
      startDate: params.departureDate,
      endDate,
    });

    const graph = this.buildGraph(flights);
    const routes = this.findAllRoutes(
      graph,
      params.origin,
      params.destination,
      params.maxTransfers || 2,
      params.minLayoverHours || 2,
      params.maxLayoverHours || 24,
    );

    const scoredRoutes = routes.map((route) => this.calculateScore(route));
    scoredRoutes.sort((a, b) => b.score - a.score);

    return scoredRoutes;
  }

  /**
   * 获取所有相关航班
   * 支持固定日期或日期区间查询
   */
  private async getAllRelevantFlights(
    dto: PlanRouteDto,
  ): Promise<Flight[]> {
    const startDate = new Date(dto.departureDate);
    let endDate: Date;

    if (dto.endDate) {
      // 如果提供了 endDate，使用日期区间
      endDate = new Date(dto.endDate);
    } else {
      // 否则查询当天和次日（用于路径搜索的连续性）
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
    }

    return this.flightService.queryFlights({
      origin: dto.origin,
      destination: dto.destination,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    });
  }

  /**
   * 构建航班图
   */
  private buildGraph(flights: Flight[]): Map<string, GraphNode> {
    const graph = new Map<string, GraphNode>();

    flights.forEach((flight) => {
      if (!graph.has(flight.origin)) {
        graph.set(flight.origin, { city: flight.origin, flights: [] });
      }
      graph.get(flight.origin)!.flights.push(flight);
    });

    return graph;
  }

  /**
   * 查找所有可行路径（DFS）
   */
  private findAllRoutes(
    graph: Map<string, GraphNode>,
    current: string,
    destination: string,
    maxTransfers: number,
    minLayoverHours: number,
    maxLayoverHours: number,
    currentPath: Flight[] = [],
    visited: Set<string> = new Set(),
  ): RouteResultDto[] {
    const routes: RouteResultDto[] = [];

    // 到达目的地
    if (current === destination && currentPath.length > 0) {
      routes.push(this.buildRouteResult(currentPath));
      return routes;
    }

    // 超过最大中转次数
    if (currentPath.length > maxTransfers + 1) {
      return routes;
    }

    // 防止循环
    if (visited.has(current)) {
      return routes;
    }

    visited.add(current);

    const node = graph.get(current);
    if (!node) {
      visited.delete(current);
      return routes;
    }

    // 遍历所有可用航班
    for (const flight of node.flights) {
      // 检查中转时间是否合理
      if (currentPath.length > 0) {
        const lastFlight = currentPath[currentPath.length - 1];
        const layoverMinutes = this.calculateLayover(lastFlight, flight);

        if (
          layoverMinutes < minLayoverHours * 60 ||
          layoverMinutes > maxLayoverHours * 60
        ) {
          continue;
        }
      }

      // 递归搜索
      const subRoutes = this.findAllRoutes(
        graph,
        flight.destination,
        destination,
        maxTransfers,
        minLayoverHours,
        maxLayoverHours,
        [...currentPath, flight],
        new Set(visited),
      );

      routes.push(...subRoutes);
    }

    visited.delete(current);
    return routes;
  }

  /**
   * 构建路线结果
   */
  private buildRouteResult(flights: Flight[]): RouteResultDto {
    const segments: FlightSegmentDto[] = flights.map((flight) => ({
      flightNo: flight.flightNo,
      origin: flight.origin,
      destination: flight.destination,
      departureTime: flight.departureTime,
      arrivalTime: flight.arrivalTime,
      duration: this.calculateDuration(
        flight.departureTime,
        flight.arrivalTime,
      ),
    }));

    const layovers = [];
    for (let i = 0; i < flights.length - 1; i++) {
      layovers.push({
        city: flights[i].destination,
        duration: this.calculateLayover(flights[i], flights[i + 1]),
      });
    }

    const totalDuration = this.calculateDuration(
      flights[0].departureTime,
      flights[flights.length - 1].arrivalTime,
    );

    return {
      segments,
      totalDuration,
      transferCount: flights.length - 1,
      layovers,
      score: 0, // 稍后计算
    };
  }

  /**
   * 计算评分
   */
  private calculateScore(route: RouteResultDto): RouteResultDto {
    // 评分因素：
    // 1. 总耗时（越短越好）- 权重 70%
    // 2. 中转次数（越少越好）- 权重 30%

    const timeScore = 1000 / (route.totalDuration / 60); // 时间权重
    const transferScore = 100 / (route.transferCount + 1); // 中转权重

    route.score = timeScore * 0.7 + transferScore * 0.3;

    return route;
  }

  /**
   * 计算航班时长（分钟）
   */
  private calculateDuration(start: Date, end: Date): number {
    return Math.floor((end.getTime() - start.getTime()) / 1000 / 60);
  }

  /**
   * 计算中转时间（分钟）
   */
  private calculateLayover(flight1: Flight, flight2: Flight): number {
    return this.calculateDuration(flight1.arrivalTime, flight2.departureTime);
  }
}
