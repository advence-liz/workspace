import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Flight } from './entities/flight.entity';
import { Airport } from './entities/airport.entity';
import { QueryFlightsDto } from './dto/query-flights.dto';
import {
  DestinationResultDto,
  DestinationsResponseDto,
  RoundTripFlightsDto,
} from './dto/destination-result.dto';
import { QueryFlightsWithPaginationDto } from './dto/query-flights-pagination.dto';
import { UpdateFlightDto } from './dto/update-flight.dto';
import { BatchDeleteFlightsDto } from './dto/batch-delete-flights.dto';

@Injectable()
export class FlightService {
  constructor(
    @InjectRepository(Flight)
    private flightRepository: Repository<Flight>,
    @InjectRepository(Airport)
    private airportRepository: Repository<Airport>,
  ) {}

  /**
   * 查询所有可达目的地（包含往返航班信息）
   */
  async queryDestinations(
    dto: QueryFlightsDto,
  ): Promise<DestinationsResponseDto> {
    const { origin, startDate, endDate, flightType } = dto;

    // 构建查询条件 - 只查询666和2666权益卡航班
    // 修复日期范围：使用 QueryBuilder 以支持复杂的日期查询
    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);
    endDateTime.setHours(23, 59, 59, 999); // 设置为当天结束

    let query = this.flightRepository.createQueryBuilder('flight')
      .where('flight.origin = :origin', { origin })
      .andWhere('flight.departureTime >= :startDateTime', { startDateTime })
      .andWhere('flight.departureTime <= :endDateTime', { endDateTime })
      .orderBy('flight.departureTime', 'ASC');

    // 权益卡类型过滤：使用 Like 匹配，支持组合类型（如"666权益卡航班,2666权益卡航班"）
    if (flightType && flightType !== '全部') {
      // 查询包含指定权益卡类型的航班（支持组合类型）
      query = query.andWhere('flight.cardType LIKE :cardType', { cardType: `%${flightType}%` });
    }
    // 如果是"全部"，不添加 cardType 过滤条件，查询所有航班

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

      // 收集权益卡类型（去重）
      if (flight.cardType) {
        // 处理组合类型（如 "666权益卡航班,2666权益卡航班"）
        const types = flight.cardType.split(',').map(t => t.trim());
        types.forEach(type => {
          if (type && !destData.cardTypes.includes(type)) {
            destData.cardTypes.push(type);
          }
        });
      }
    });

    // 查询返程航班信息
    const destinations = Array.from(destinationMap.keys());
    for (const dest of destinations) {
      let returnQuery = this.flightRepository.createQueryBuilder('flight')
        .where('flight.origin = :dest', { dest })
        .andWhere('flight.destination = :origin', { origin })
        .andWhere('flight.departureTime >= :startDateTime', { startDateTime })
        .andWhere('flight.departureTime <= :endDateTime', { endDateTime })
        .orderBy('flight.departureTime', 'ASC');

      // 应用相同的权益卡类型过滤
      if (flightType && flightType !== '全部') {
        returnQuery = returnQuery.andWhere('flight.cardType LIKE :cardType', { cardType: `%${flightType}%` });
      }

      const returnFlights = await returnQuery.getMany();

      if (returnFlights.length > 0) {
        const destData = destinationMap.get(dest)!;
        destData.hasReturn = true;
        destData.returnFlightCount = returnFlights.length;
        destData.returnAvailableDates = [
          ...new Set(
            returnFlights.map((f) =>
              f.departureTime.toISOString().split('T')[0],
            ),
          ),
        ];
      }
    }

    const sortedDestinations = Array.from(destinationMap.values()).sort((a, b) => {
      // 1. 可往返优先
      if (a.hasReturn !== b.hasReturn) return a.hasReturn ? -1 : 1;
      // 2. 同类型按去程航班数量降序
      if (a.flightCount !== b.flightCount) return b.flightCount - a.flightCount;
      // 3. 最后按目的地名称升序
      return a.destination.localeCompare(b.destination);
    });

    return {
      destinations: sortedDestinations,
      totalCount: sortedDestinations.length,
      dateRange: {
        start: startDate,
        end: endDate,
      },
    };
  }

  /**
   * 查询指定航线的航班 - 只查询666和2666权益卡航班
   */
  async queryFlights(dto: QueryFlightsDto): Promise<Flight[]> {
    const { origin, destination, startDate, endDate, flightType } = dto;

    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);
    endDateTime.setHours(23, 59, 59, 999);

    let query = this.flightRepository.createQueryBuilder('flight')
      .where('flight.origin = :origin', { origin })
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

    // 构建去程航班查询
    let outboundQuery = this.flightRepository.createQueryBuilder('flight')
      .where('flight.origin = :origin', { origin })
      .andWhere('flight.destination = :destination', { destination })
      .andWhere('flight.departureTime >= :startDateTime', { startDateTime })
      .andWhere('flight.departureTime <= :endDateTime', { endDateTime })
      .orderBy('flight.departureTime', 'ASC');

    // 构建返程航班查询
    let returnQuery = this.flightRepository.createQueryBuilder('flight')
      .where('flight.origin = :dest', { dest: destination })
      .andWhere('flight.destination = :orig', { orig: origin })
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
  async getAvailableCities(): Promise<{ origins: string[]; destinations: string[] }> {
    // 优先从 airports 表获取已发现的机场
    const airports = await this.airportRepository.find({
      where: { enableCrawl: true },
      order: { city: 'ASC', name: 'ASC' },
    });

    if (airports.length > 0) {
      // 如果有已发现的机场，直接返回（所有机场都可作为出发地或目的地）
      const airportNames = airports.map(a => a.name);
      return {
        origins: airportNames,
        destinations: airportNames,
      };
    }

    // 如果 airports 表为空，从 flights 表查询（兼容旧数据）
    const origins = await this.getAvailableOrigins();
    const destinations = await this.getAvailableDestinations();

    return {
      origins,
      destinations,
    };
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
    const airportSet = new Set<{ name: string; city: string }>();

    for (const flight of flights) {
      // 从出发地发现机场
      if (flight.origin) {
        const originCity = this.extractCityName(flight.origin);
        airportSet.add({ name: flight.origin, city: originCity });
      }
      // 从目的地发现机场
      if (flight.destination) {
        const destCity = this.extractCityName(flight.destination);
        airportSet.add({ name: flight.destination, city: destCity });
      }
    }

    // 批量保存（所有机场都可以作为出发地或目的地）
    for (const airport of airportSet) {
      await this.saveAirport(airport.name, airport.city);
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

    // 基于相同筛选条件统计各权益卡数量（全量，不受分页影响）
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

    const allForStats = await statsBuilder.select('flight.cardType', 'cardType').getRawMany();
    let cardType666Count = 0;
    let cardType2666Count = 0;
    allForStats.forEach(({ cardType: ct }) => {
      if (!ct) return;
      // 精确匹配：避免 "2666权益卡航班" 被 "666权益卡航班" 误匹配
      // 666 可用：cardType 等于 "666权益卡航班" 或包含 "666权益卡航班,"（组合开头）或包含 ",666权益卡航班"（组合末尾）
      const has666 = ct === '666权益卡航班' || ct.startsWith('666权益卡航班,') || ct.includes(',666权益卡航班');
      const has2666 = ct.includes('2666权益卡航班');
      if (has666) cardType666Count++;
      if (has2666) cardType2666Count++;
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
}
