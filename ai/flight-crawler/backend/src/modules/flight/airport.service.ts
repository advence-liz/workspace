import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Airport } from './entities/airport.entity';
import { Flight } from './entities/flight.entity';
import { QueryAirportsWithPaginationDto } from './dto/query-airports-pagination.dto';
import { UpdateAirportDto } from './dto/update-airport.dto';

@Injectable()
export class AirportService {
  constructor(
    @InjectRepository(Airport)
    private airportRepository: Repository<Airport>,
    @InjectRepository(Flight)
    private flightRepository: Repository<Flight>,
  ) {}

  /**
   * 分页查询机场（支持筛选、排序）
   */
  async queryAirportsWithPagination(
    dto: QueryAirportsWithPaginationDto,
  ): Promise<{
    airports: Airport[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const {
      page = 1,
      pageSize = 10,
      city,
      name,
      enableCrawl,
      sortBy = 'name',
      sortOrder = 'ASC',
    } = dto;

    // 构建查询条件
    const queryBuilder = this.airportRepository.createQueryBuilder('airport');

    if (city) {
      queryBuilder.andWhere('airport.city LIKE :city', { city: `%${city}%` });
    }

    if (name) {
      queryBuilder.andWhere('airport.name LIKE :name', { name: `%${name}%` });
    }

    if (enableCrawl !== undefined) {
      queryBuilder.andWhere('airport.enableCrawl = :enableCrawl', { enableCrawl });
    }

    // 排序
    queryBuilder.orderBy(`airport.${sortBy}`, sortOrder);

    // 分页
    const skip = (page - 1) * pageSize;
    queryBuilder.skip(skip).take(pageSize);

    // 执行查询
    const [airports, total] = await queryBuilder.getManyAndCount();

    return {
      airports,
      total,
      page,
      pageSize,
    };
  }

  /**
   * 按 ID 查询单条机场
   */
  async findAirportById(id: number): Promise<Airport | null> {
    return this.airportRepository.findOne({ where: { id } });
  }

  /**
   * 更新机场
   */
  async updateAirport(id: number, updateData: UpdateAirportDto): Promise<Airport> {
    const airport = await this.findAirportById(id);
    if (!airport) {
      throw new Error(`机场 ID ${id} 不存在`);
    }

    Object.assign(airport, updateData);
    return this.airportRepository.save(airport);
  }

  /**
   * 删除单条机场
   */
  async deleteAirport(id: number): Promise<void> {
    const result = await this.airportRepository.delete(id);
    if (result.affected === 0) {
      throw new Error(`机场 ID ${id} 不存在`);
    }
  }

  /**
   * 批量删除机场
   */
  async batchDeleteAirports(ids: number[]): Promise<number> {
    const result = await this.airportRepository.delete(ids);
    return result.affected || 0;
  }

  /**
   * 获取机场统计信息（关联的航班数量）
   */
  async getAirportStats(id: number): Promise<{
    airportId: number;
    airportName: string;
    city: string;
    enableCrawl: boolean;
    totalFlights: number;
    asOriginCount: number;
    asDestinationCount: number;
  }> {
    const airport = await this.findAirportById(id);
    if (!airport) {
      throw new Error(`机场 ID ${id} 不存在`);
    }

    // 统计作为出发地的航班数
    const asOriginCount = await this.flightRepository.count({
      where: { origin: airport.name },
    });

    // 统计作为目的地的航班数
    const asDestinationCount = await this.flightRepository.count({
      where: { destination: airport.name },
    });

    return {
      airportId: airport.id,
      airportName: airport.name,
      city: airport.city,
      enableCrawl: airport.enableCrawl,
      totalFlights: asOriginCount + asDestinationCount,
      asOriginCount,
      asDestinationCount,
    };
  }
}
