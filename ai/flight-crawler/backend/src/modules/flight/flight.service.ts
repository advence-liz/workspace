import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Flight } from './entities/flight.entity';
import { Airport } from './entities/airport.entity';
import { QueryCache } from '../route/entities/query-cache.entity';
import { QueryFlightsDto } from './dto/query-flights.dto';
import {
  DestinationResultDto,
  DestinationsResponseDto,
  RoundTripFlightsDto,
} from './dto/destination-result.dto';
import { QueryFlightsWithPaginationDto } from './dto/query-flights-pagination.dto';
import { UpdateFlightDto } from './dto/update-flight.dto';
import { BatchDeleteFlightsDto } from './dto/batch-delete-flights.dto';

const DISABLED = process.env.DISABLE_CACHE === 'true';
const DESTINATIONS_CACHE_TTL_MS = DISABLED ? 0 : 24 * 60 * 60 * 1000;
const SHORT_CACHE_TTL_MS = DISABLED ? 0 : 30 * 60 * 1000; // 30 分钟，用于规划类接口

@Injectable()
export class FlightService {
  private readonly logger = new Logger(FlightService.name);

  constructor(
    @InjectRepository(Flight)
    private flightRepository: Repository<Flight>,
    @InjectRepository(Airport)
    private airportRepository: Repository<Airport>,
    @InjectRepository(QueryCache)
    private queryCacheRepository: Repository<QueryCache>,
  ) {}

  /**
   * 查询所有可达目的地（包含往返航班信息）
   * - includeReturn=false: 仅查去程，立即返回（无缓存，用于首屏快速渲染）
   * - includeReturn=true (默认): 包含返程，使用 DB 缓存（24h TTL）+ 批量查询消除 N+1
   */
  async queryDestinations(
    dto: QueryFlightsDto,
  ): Promise<DestinationsResponseDto> {
    const { origin, startDate, endDate, flightType, includeReturn = true } = dto;
    // 默认 2666（显示全部），选 666 时只显示 666 可用航班
    const flightTypeKey = flightType || '2666权益卡航班';

    // 仅在包含返程时使用缓存
    if (includeReturn) {
      const cacheKey = `destinations|${origin}|${startDate}|${endDate}|${flightTypeKey}`;
      const cached = await this.queryCacheRepository.findOne({ where: { cacheKey } });
      if (cached && cached.expireAt > new Date()) {
        this.logger.log(`目的地查询命中缓存: ${cacheKey}`);
        return JSON.parse(cached.data);
      }
    }

    // 展开城市为机场列表
    const originAirports = await this.expandCityToAirports(origin);

    // 构建查询条件
    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);
    endDateTime.setHours(23, 59, 59, 999);

    let query = this.flightRepository.createQueryBuilder('flight')
      .where('flight.origin IN (:...originAirports)', { originAirports })
      .andWhere('flight.departureTime >= :startDateTime', { startDateTime })
      .andWhere('flight.departureTime <= :endDateTime', { endDateTime })
      .orderBy('flight.departureTime', 'ASC');

    // 选 666 时只显示 666 可用航班；选 2666 或不传时显示全部（2666 全部可用）
    if (flightType === '666权益卡航班') {
      query = query.andWhere('flight.cardType LIKE :cardType', { cardType: `%${flightType}%` });
    }

    // 查询所有符合条件的去程航班
    const outboundFlights = await query.getMany();

    // 按目的地分组统计去程航班
    const destinationMap = new Map<string, DestinationResultDto>();

    outboundFlights.forEach((flight) => {
      const dest = flight.destination;
      const dateStr = flight.departureTime.toISOString().split('T')[0];

      if (!destinationMap.has(dest)) {
        destinationMap.set(dest, {
          destination: dest,
          flightCount: 0,
          availableDates: [],
          cardTypes: [],
          hasReturn: false,
          returnFlightCount: 0,
          returnAvailableDates: [],
        });
      }

      const destData = destinationMap.get(dest)!;
      destData.flightCount++;

      if (!destData.availableDates.includes(dateStr)) {
        destData.availableDates.push(dateStr);
      }

      if (flight.cardType) {
        const types = flight.cardType.split(',').map(t => t.trim());
        types.forEach(type => {
          if (type && !destData.cardTypes.includes(type)) {
            destData.cardTypes.push(type);
          }
        });
      }
    });

    // 批量查询所有返程航班（消除 N+1，仅 includeReturn=true 时执行）
    const destList = Array.from(destinationMap.keys());
    if (includeReturn && destList.length > 0) {
      let returnQuery = this.flightRepository.createQueryBuilder('flight')
        .where('flight.destination IN (:...originAirports)', { originAirports })
        .andWhere('flight.origin IN (:...destList)', { destList })
        .andWhere('flight.departureTime >= :startDateTime', { startDateTime })
        .andWhere('flight.departureTime <= :endDateTime', { endDateTime });

      if (flightType === '666权益卡航班') {
        returnQuery = returnQuery.andWhere('flight.cardType LIKE :cardType', { cardType: `%${flightType}%` });
      }

      const allReturnFlights = await returnQuery.getMany();

      // 按出发地（= 去程目的地）分组
      const returnMap = new Map<string, Flight[]>();
      for (const f of allReturnFlights) {
        if (!returnMap.has(f.origin)) returnMap.set(f.origin, []);
        returnMap.get(f.origin)!.push(f);
      }

      for (const [dest, returnFlights] of returnMap) {
        const destData = destinationMap.get(dest);
        if (destData) {
          destData.hasReturn = true;
          destData.returnFlightCount = returnFlights.length;
          destData.returnAvailableDates = [
            ...new Set(returnFlights.map(f => f.departureTime.toISOString().split('T')[0])),
          ];
        }
      }
    }

    const sortedDestinations = Array.from(destinationMap.values()).sort((a, b) => {
      if (includeReturn && a.hasReturn !== b.hasReturn) return a.hasReturn ? -1 : 1;
      if (a.flightCount !== b.flightCount) return b.flightCount - a.flightCount;
      return a.destination.localeCompare(b.destination);
    });

    const result: DestinationsResponseDto = {
      destinations: sortedDestinations,
      totalCount: sortedDestinations.length,
      dateRange: {
        start: startDate,
        end: endDate,
      },
    };

    // 仅 includeReturn=true 时写入缓存
    if (includeReturn) {
      const cacheKey = `destinations|${origin}|${startDate}|${endDate}|${flightTypeKey}`;
      const expireAt = new Date(Date.now() + DESTINATIONS_CACHE_TTL_MS);
      await this.queryCacheRepository.save({
        cacheKey,
        data: JSON.stringify(result),
        expireAt,
        createdAt: new Date(),
      });
      this.logger.log(`目的地查询结果已写入缓存: ${cacheKey}`);
    }

    return result;
  }

  /**
   * 全量加载日期范围内所有航班（用于中转搜索，1次SQL替代N+1）
   */
  async queryAllFlightsInRange(startDate: string, endDate: string, flightType?: string): Promise<Flight[]> {
    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);
    endDateTime.setHours(23, 59, 59, 999);
    let query = this.flightRepository.createQueryBuilder('flight')
      .where('flight.departureTime >= :startDateTime', { startDateTime })
      .andWhere('flight.departureTime <= :endDateTime', { endDateTime })
      .orderBy('flight.departureTime', 'ASC');
    if (flightType === '666权益卡航班') {
      query = query.andWhere('flight.cardType LIKE :cardType', { cardType: `%${flightType}%` });
    }
    return query.getMany();
  }

  /**
   * 查询指定航线的航班 - 只查询666和2666权益卡航班
   */
  async queryFlights(dto: QueryFlightsDto & { origins?: string[] }): Promise<Flight[]> {
    const { origin, origins, destination, startDate, endDate, flightType } = dto;

    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);
    endDateTime.setHours(23, 59, 59, 999);

    // 支持多出发地（origins 优先，兼容单出发地 origin）
    const originList = origins && origins.length > 0 ? origins : [origin];

    let query = this.flightRepository.createQueryBuilder('flight')
      .where('flight.origin IN (:...originList)', { originList })
      .andWhere('flight.departureTime >= :startDateTime', { startDateTime })
      .andWhere('flight.departureTime <= :endDateTime', { endDateTime })
      .orderBy('flight.departureTime', 'ASC');

    if (destination) {
      query = query.andWhere('flight.destination = :destination', { destination });
    }

    // 权益卡类型过滤：使用 Like 匹配，支持组合类型（如"666权益卡航班,2666权益卡航班"）
    if (flightType && flightType !== '全部') {
      // 查询包含指定权益卡类型的航班（支持组合类型）
      query = query.andWhere('flight.cardType LIKE :cardType', { cardType: `%${flightType}%` });
    }
    // 如果是"全部"，不添加 cardType 过滤条件，查询所有航班

    return query.getMany();
  }

  /**
   * 查询往返航班详情
   */
  async queryRoundTripFlights(dto: QueryFlightsDto): Promise<RoundTripFlightsDto> {
    const { origin, destination, startDate, endDate, flightType } = dto;

    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);
    endDateTime.setHours(23, 59, 59, 999);

    // 展开城市为机场列表（支持"北京"→["北京首都","北京大兴"]）
    const originAirports = await this.expandCityToAirports(origin);
    const destAirports = await this.expandCityToAirports(destination ?? '');

    // 构建去程航班查询
    let outboundQuery = this.flightRepository.createQueryBuilder('flight')
      .where('flight.origin IN (:...originAirports)', { originAirports })
      .andWhere('flight.destination IN (:...destAirports)', { destAirports })
      .andWhere('flight.departureTime >= :startDateTime', { startDateTime })
      .andWhere('flight.departureTime <= :endDateTime', { endDateTime })
      .orderBy('flight.departureTime', 'ASC');

    // 构建返程航班查询
    let returnQuery = this.flightRepository.createQueryBuilder('flight')
      .where('flight.origin IN (:...destAirports)', { destAirports })
      .andWhere('flight.destination IN (:...originAirports)', { originAirports })
      .andWhere('flight.departureTime >= :startDateTime', { startDateTime })
      .andWhere('flight.departureTime <= :endDateTime', { endDateTime })
      .orderBy('flight.departureTime', 'ASC');

    // 应用权益卡类型过滤
    if (flightType && flightType !== '全部') {
      outboundQuery = outboundQuery.andWhere('flight.cardType LIKE :cardType', { cardType: `%${flightType}%` });
      returnQuery = returnQuery.andWhere('flight.cardType LIKE :cardType', { cardType: `%${flightType}%` });
    }

    // 查询去程航班
    const outboundFlights = await outboundQuery.getMany();

    // 查询返程航班
    const returnFlights = await returnQuery.getMany();

    return {
      outboundFlights,
      returnFlights,
    };
  }

  /**
   * 批量保存航班数据
   * 使用 INSERT OR IGNORE 忽略唯一约束冲突，不会因重复数据报错终止
   */
  async saveFlights(flights: Partial<Flight>[]): Promise<void> {
    if (flights.length === 0) return;

    await this.flightRepository
      .createQueryBuilder()
      .insert()
      .into(Flight)
      .values(flights as Flight[])
      .orIgnore()
      .execute();
  }

  /**
   * 删除过期航班数据
   */
  async deleteExpiredFlights(): Promise<void> {
    const now = new Date();
    await this.flightRepository
      .createQueryBuilder()
      .delete()
      .where('departureTime < :now', { now })
      .execute();
  }

  /**
   * 删除所有未来的航班数据（用于发现航班前清理）
   * 返回删除的记录数
   */
  async deleteFutureFlights(): Promise<number> {
    const now = new Date();
    const result = await this.flightRepository
      .createQueryBuilder()
      .delete()
      .where('departureTime >= :now', { now })
      .execute();

    return result.affected || 0;
  }

  /**
   * 删除指定日期的航班数据（用于发现机场阶段清理临时数据）
   * 返回删除的记录数
   */
  async deleteDiscoveryFlights(dates: string[]): Promise<number> {
    if (dates.length === 0) {
      return 0;
    }

    const startOfDay = new Date(dates[0]);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(dates[dates.length - 1]);
    endOfDay.setHours(23, 59, 59, 999);

    const result = await this.flightRepository
      .createQueryBuilder()
      .delete()
      .where('departureTime >= :start AND departureTime <= :end', {
        start: startOfDay,
        end: endOfDay,
      })
      .execute();

    return result.affected || 0;
  }

  /**
   * 删除指定日期之前的历史航班数据
   * @param beforeDate 截止日期（不含），删除 departureTime < beforeDate 的航班
   * 返回删除的记录数
   */
  async deleteFlightsBeforeDate(beforeDate: Date): Promise<number> {
    const result = await this.flightRepository
      .createQueryBuilder()
      .delete()
      .where('departureTime < :beforeDate', { beforeDate })
      .execute();

    return result.affected || 0;
  }

  /**
   * 删除指定出发地+日期的航班数据（按机场+日期粒度删除）
   * 用于发现航班任务：只替换成功爬取的机场数据，失败的机场保留旧数据
   */
  async deleteFlightsByOriginAndDate(origin: string, date: string): Promise<number> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const result = await this.flightRepository
      .createQueryBuilder()
      .delete()
      .where('origin = :origin AND departureTime >= :start AND departureTime <= :end', {
        origin,
        start: startOfDay,
        end: endOfDay,
      })
      .execute();

    return result.affected || 0;
  }

  /**
   * 删除指定单个日期的航班数据（按天粒度删除，用于每日任务）
   * 返回删除的记录数
   */
  async deleteFlightsByDate(date: string): Promise<number> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const result = await this.flightRepository
      .createQueryBuilder()
      .delete()
      .where('departureTime >= :start AND departureTime < :end', {
        start: startOfDay,
        end: endOfDay,
      })
      .execute();

    return result.affected || 0;
  }

  /**
   * 获取所有可用的出发地列表
   */
  async getAvailableOrigins(): Promise<string[]> {
    const result = await this.flightRepository
      .createQueryBuilder('flight')
      .select('DISTINCT flight.origin', 'origin')
      .where('flight.departureTime >= :now', { now: new Date() })
      .getRawMany();

    return result.map((r) => r.origin).sort();
  }

  /**
   * 获取所有可用的目的地列表
   */
  async getAvailableDestinations(): Promise<string[]> {
    const result = await this.flightRepository
      .createQueryBuilder('flight')
      .select('DISTINCT flight.destination', 'destination')
      .where('flight.departureTime >= :now', { now: new Date() })
      .getRawMany();

    return result.map((r) => r.destination).sort();
  }

  /**
   * 获取所有可用的城市列表
   * 优先从 airports 表获取已发现的机场（更完整），如果为空则从 flights 表查询
   * 所有机场都可以作为出发地或目的地
   */
  async getAvailableCities(): Promise<{ origins: string[]; destinations: string[]; cityList: string[]; minDate: string | null; maxDate: string | null }> {
    // 查询数据库中航班的日期范围
    const dateRange = await this.flightRepository
      .createQueryBuilder('flight')
      .select('MIN(DATE(flight.departureTime))', 'minDate')
      .addSelect('MAX(DATE(flight.departureTime))', 'maxDate')
      .getRawOne<{ minDate: string | null; maxDate: string | null }>();

    // 优先从 airports 表获取已发现的机场
    const airports = await this.airportRepository.find({
      where: { enableCrawl: true },
      order: { city: 'ASC', name: 'ASC' },
    });

    const minDate = dateRange?.minDate ?? null;
    const maxDate = dateRange?.maxDate ?? null;

    if (airports.length > 0) {
      const airportNames = airports.map(a => a.name);
      // 城市维度去重（北京/上海各只出现一次）
      const cityList = [...new Set(airports.map(a => a.city))].sort();
      return { origins: airportNames, destinations: airportNames, cityList, minDate, maxDate };
    }

    // 如果 airports 表为空，从 flights 表查询（兼容旧数据）
    const origins = await this.getAvailableOrigins();
    const destinations = await this.getAvailableDestinations();
    const cityList = [...new Set([...origins, ...destinations])].sort();
    return { origins, destinations, cityList, minDate, maxDate };
  }

  /**
   * 将城市名展开为该城市下所有机场名
   * 例如："北京" -> ["北京首都", "北京大兴"]
   * 兼容直接传机场名：如果找不到匹配城市，原样返回
   */
  async expandCityToAirports(cityOrAirport: string): Promise<string[]> {
    const airports = await this.airportRepository.find({
      where: { city: cityOrAirport, enableCrawl: true },
      order: { name: 'ASC' },
    });
    if (airports.length > 0) return airports.map(a => a.name);
    return [cityOrAirport];
  }

  /**
   * 保存或更新机场信息
   * 所有机场都可以作为出发地或目的地，不区分类型
   */
  async saveAirport(name: string, city: string): Promise<Airport> {
    let airport = await this.airportRepository.findOne({ where: { name } });

    if (!airport) {
      // 创建新机场
      airport = this.airportRepository.create({ name, city });
      return this.airportRepository.save(airport);
    }

    // 如果已存在，直接返回
    return airport;
  }

  /**
   * 批量保存机场信息（从航班数据中自动发现）
   * 所有发现的机场都可以作为出发地或目的地
   */
  async discoverAirportsFromFlights(flights: Partial<Flight>[]): Promise<void> {
    // 收集所有唯一机场名
    const airportMap = new Map<string, string>(); // name -> city
    for (const flight of flights) {
      if (flight.origin) airportMap.set(flight.origin, this.extractCityName(flight.origin));
      if (flight.destination) airportMap.set(flight.destination, this.extractCityName(flight.destination));
    }
    if (airportMap.size === 0) return;

    // 一次查出已存在的机场，避免 N+1
    const names = Array.from(airportMap.keys());
    const existing = await this.airportRepository.find({ where: names.map(name => ({ name })) });
    const existingNames = new Set(existing.map(a => a.name));

    // 只插入不存在的
    const toInsert = names
      .filter(name => !existingNames.has(name))
      .map(name => this.airportRepository.create({ name, city: airportMap.get(name)! }));

    if (toInsert.length > 0) {
      await this.airportRepository.save(toInsert);
      this.logger.log(`批量新增 ${toInsert.length} 个机场`);
    }
  }

  /**
   * 从完整机场名称中提取城市名
   * 例如：北京首都 -> 北京，上海虹桥 -> 上海
   */
  private extractCityName(airportName: string): string {
    const airportSuffixes = ['首都', '大兴', '浦东', '虹桥', '白云', '宝安', '天河', '萧山', '流亭', '周水子', '江北', '双流', '天府', '咸阳', '长水', '黄花', '凤凰', '新', '机场'];

    for (const suffix of airportSuffixes) {
      if (airportName.endsWith(suffix)) {
        return airportName.substring(0, airportName.length - suffix.length);
      }
    }

    // 如果没有匹配到后缀，返回原名称
    return airportName;
  }

  /**
   * 获取所有启用爬虫的机场
   */
  async getEnabledAirports(): Promise<Airport[]> {
    return this.airportRepository.find({
      where: { enableCrawl: true },
      order: { city: 'ASC', name: 'ASC' },
    });
  }

  /**
   * 获取所有启用爬虫的机场名称列表
   * 所有机场都可以作为出发地或目的地
   */
  async getEnabledOriginAirports(): Promise<string[]> {
    const airports = await this.airportRepository.find({
      where: { enableCrawl: true },
      order: { city: 'ASC', name: 'ASC' },
    });
    return airports.map(a => a.name);
  }

  /**
   * 分页查询航班（支持筛选、排序）
   */
  async queryFlightsWithPagination(
    dto: QueryFlightsWithPaginationDto,
  ): Promise<{
    flights: Flight[];
    total: number;
    page: number;
    pageSize: number;
    cardType666Count: number;
    cardType2666Count: number;
  }> {
    const {
      page = 1,
      pageSize = 10,
      origin,
      destination,
      startDate,
      endDate,
      cardType,
      flightNo,
      sortBy = 'departureTime',
      sortOrder = 'ASC',
    } = dto;

    // 构建查询条件
    const queryBuilder = this.flightRepository.createQueryBuilder('flight');

    if (origin) {
      queryBuilder.andWhere('flight.origin = :origin', { origin });
    }

    if (destination) {
      queryBuilder.andWhere('flight.destination = :destination', { destination });
    }

    if (startDate && endDate) {
      const startDateTime = new Date(startDate);
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      queryBuilder.andWhere('flight.departureTime BETWEEN :startDate AND :endDate', {
        startDate: startDateTime,
        endDate: endDateTime,
      });
    }

    if (cardType && cardType !== '全部') {
      // 使用 LIKE 匹配，支持组合类型（如"666权益卡航班,2666权益卡航班"）
      queryBuilder.andWhere('flight.cardType LIKE :cardType', { cardType: `%${cardType}%` });
    }

    if (flightNo) {
      queryBuilder.andWhere('flight.flightNo LIKE :flightNo', { flightNo: `%${flightNo}%` });
    }

    // 排序
    queryBuilder.orderBy(`flight.${sortBy}`, sortOrder);

    // 分页
    const skip = (page - 1) * pageSize;
    queryBuilder.skip(skip).take(pageSize);

    // 执行查询
    const [flights, total] = await queryBuilder.getManyAndCount();

    // 用 SQL COUNT + GROUP BY 统计各权益卡数量（一次查询替代全量加载后内存遍历）
    const statsBuilder = this.flightRepository.createQueryBuilder('flight');
    if (origin) statsBuilder.andWhere('flight.origin = :origin', { origin });
    if (destination) statsBuilder.andWhere('flight.destination = :destination', { destination });
    if (startDate && endDate) {
      const startDateTime = new Date(startDate);
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      statsBuilder.andWhere('flight.departureTime BETWEEN :startDate AND :endDate', {
        startDate: startDateTime,
        endDate: endDateTime,
      });
    }
    if (flightNo) statsBuilder.andWhere('flight.flightNo LIKE :flightNo', { flightNo: `%${flightNo}%` });

    const cardTypeStats = await statsBuilder
      .select('flight.cardType', 'cardType')
      .addSelect('COUNT(*)', 'cnt')
      .groupBy('flight.cardType')
      .getRawMany<{ cardType: string; cnt: string }>();

    let cardType666Count = 0;
    let cardType2666Count = 0;
    cardTypeStats.forEach(({ cardType: ct, cnt }) => {
      if (!ct) return;
      const count = parseInt(cnt, 10);
      const has666 = ct === '666权益卡航班' || ct.startsWith('666权益卡航班,') || ct.includes(',666权益卡航班');
      const has2666 = ct.includes('2666权益卡航班');
      if (has666) cardType666Count += count;
      if (has2666) cardType2666Count += count;
    });

    return {
      flights,
      total,
      page,
      pageSize,
      cardType666Count,
      cardType2666Count,
    };
  }

  /**
   * 按 ID 查询单条航班
   */
  async findFlightById(id: number): Promise<Flight | null> {
    return this.flightRepository.findOne({ where: { id } });
  }

  /**
   * 更新航班
   */
  async updateFlight(id: number, updateData: UpdateFlightDto): Promise<Flight> {
    const flight = await this.findFlightById(id);
    if (!flight) {
      throw new Error(`航班 ID ${id} 不存在`);
    }

    // 如果有时间字段，转换为 Date 对象
    if (updateData.departureTime) {
      updateData.departureTime = new Date(updateData.departureTime) as any;
    }
    if (updateData.arrivalTime) {
      updateData.arrivalTime = new Date(updateData.arrivalTime) as any;
    }

    Object.assign(flight, updateData);
    return this.flightRepository.save(flight);
  }

  /**
   * 删除单条航班
   */
  async deleteFlight(id: number): Promise<void> {
    const result = await this.flightRepository.delete(id);
    if (result.affected === 0) {
      throw new Error(`航班 ID ${id} 不存在`);
    }
  }

  /**
   * 批量删除航班
   */
  async batchDeleteFlights(ids: number[]): Promise<number> {
    const result = await this.flightRepository.delete(ids);
    return result.affected || 0;
  }

  /**
   * 清除所有查询缓存
   */
  async clearQueryCache(): Promise<{ deletedCount: number }> {
    const result = await this.queryCacheRepository.clear();
    this.logger.log(`已清除所有查询缓存`);
    return { deletedCount: (result as any)?.affected ?? 0 };
  }

  /**
   * 批量删除缓存（按 cacheKey 列表）
   */
  async deleteCacheByKeys(keys: string[]): Promise<{ deletedCount: number }> {
    const result = await this.queryCacheRepository
      .createQueryBuilder()
      .delete()
      .where('cacheKey IN (:...keys)', { keys })
      .execute();
    return { deletedCount: result.affected ?? 0 };
  }

  /**
   * 查询缓存列表（分页 + 按类型筛选）
   */
  async listQueryCache(params: {
    page?: number;
    pageSize?: number;
    type?: string; // destinations / explore / transfer
  }): Promise<{ list: { cacheKey: string; type: string; createdAt: Date; expireAt: Date; expired: boolean; dataSize: number }[]; total: number }> {
    const { page = 1, pageSize = 20, type } = params;
    const now = new Date();

    let qb = this.queryCacheRepository.createQueryBuilder('c');
    if (type) qb = qb.where('c.cacheKey LIKE :prefix', { prefix: `${type}|%` });

    const total = await qb.getCount();
    const items = await qb
      .orderBy('c.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    const list = items.map(item => ({
      cacheKey: item.cacheKey,
      type: item.cacheKey.split('|')[0],
      createdAt: item.createdAt,
      expireAt: item.expireAt,
      expired: item.expireAt <= now,
      dataSize: item.data.length,
    }));

    return { list, total };
  }

  /**
   * 查询缓存统计
   */
  async getQueryCacheStats(): Promise<{ total: number; expired: number; valid: number; disabled: boolean }> {
    const total = await this.queryCacheRepository.count();
    const expired = await this.queryCacheRepository
      .createQueryBuilder('c')
      .where('c.expireAt <= :now', { now: new Date() })
      .getCount();
    return { total, expired, valid: total - expired, disabled: process.env.DISABLE_CACHE === 'true' };
  }

  /**
   * 切换缓存开关（运行时修改环境变量）
   */
  toggleCache(enable: boolean): { disabled: boolean } {
    process.env.DISABLE_CACHE = enable ? 'false' : 'true';
    this.logger.log(`查询缓存已${enable ? '开启' : '关闭'}`);
    return { disabled: !enable };
  }
}
