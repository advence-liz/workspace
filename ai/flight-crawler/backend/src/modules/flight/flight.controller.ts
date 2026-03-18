import {
  Controller,
  Get,
  Query,
  HttpCode,
  HttpStatus,
  Put,
  Delete,
  Post,
  Param,
  Body,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { FlightService } from './flight.service';
import { QueryFlightsDto } from './dto/query-flights.dto';
import { QueryFlightsWithPaginationDto } from './dto/query-flights-pagination.dto';
import { UpdateFlightDto } from './dto/update-flight.dto';
import { BatchDeleteFlightsDto } from './dto/batch-delete-flights.dto';

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

  /**
   * 分页查询航班（带高级筛选）
   * GET /api/flights/paginated
   */
  @Get('paginated')
  @HttpCode(HttpStatus.OK)
  async getFlightsWithPagination(@Query() query: QueryFlightsWithPaginationDto) {
    return this.flightService.queryFlightsWithPagination(query);
  }

  /**
   * 按 ID 获取航班详情
   * GET /api/flights/:id
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getFlightById(@Param('id') id: number) {
    const flight = await this.flightService.findFlightById(id);
    if (!flight) {
      throw new NotFoundException(`航班 ID ${id} 不存在`);
    }
    return flight;
  }

  /**
   * 更新航班
   * PUT /api/flights/:id
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateFlight(
    @Param('id') id: number,
    @Body() updateData: UpdateFlightDto,
  ) {
    try {
      const flight = await this.flightService.updateFlight(id, updateData);
      return {
        message: '更新成功',
        flight,
      };
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * 删除航班
   * DELETE /api/flights/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteFlight(@Param('id') id: number) {
    try {
      await this.flightService.deleteFlight(id);
      return { success: true, message: '删除成功' };
    } catch (error: any) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   * 批量删除航班
   * POST /api/flights/batch-delete
   */
  @Post('batch-delete')
  @HttpCode(HttpStatus.OK)
  async batchDeleteFlights(@Body() body: BatchDeleteFlightsDto) {
    const deletedCount = await this.flightService.batchDeleteFlights(body.ids);
    return {
      success: true,
      deletedCount,
      message: `成功删除 ${deletedCount} 条航班`,
    };
  }

  /**
   * 删除指定天数前的历史航班
   * DELETE /api/flights/before-days/:days
   */
  @Delete('before-days/:days')
  @HttpCode(HttpStatus.OK)
  async deleteFlightsBeforeDays(@Param('days') days: string) {
    const daysNum = parseInt(days, 10);
    if (isNaN(daysNum) || daysNum < 1) {
      return { success: false, message: '天数参数无效' };
    }
    const beforeDate = new Date();
    beforeDate.setDate(beforeDate.getDate() - daysNum);
    beforeDate.setHours(0, 0, 0, 0);

    const deletedCount = await this.flightService.deleteFlightsBeforeDate(beforeDate);
    return {
      success: true,
      deletedCount,
      message: `已删除 ${daysNum} 天前（${beforeDate.toISOString().split('T')[0]} 之前）的 ${deletedCount} 条航班`,
    };
  }
}
