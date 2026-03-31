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
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../../admin.guard';
import { AirportService } from './airport.service';
import { QueryAirportsWithPaginationDto } from './dto/query-airports-pagination.dto';
import { UpdateAirportDto } from './dto/update-airport.dto';
import { BatchDeleteAirportsDto } from './dto/batch-delete-airports.dto';

@Controller('airports')
export class AirportController {
  constructor(private readonly airportService: AirportService) {}

  /**
   * 分页查询机场（带高级筛选）
   * GET /api/airports/paginated
   */
  @Get('paginated')
  @HttpCode(HttpStatus.OK)
  async getAirportsWithPagination(@Query() query: QueryAirportsWithPaginationDto) {
    return this.airportService.queryAirportsWithPagination(query);
  }

  /**
   * 按 ID 获取机场详情
   * GET /api/airports/:id
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getAirportById(@Param('id') id: number) {
    const airport = await this.airportService.findAirportById(id);
    if (!airport) {
      throw new NotFoundException(`机场 ID ${id} 不存在`);
    }
    return airport;
  }

  /**
   * 获取机场统计信息
   * GET /api/airports/:id/stats
   */
  @Get(':id/stats')
  @HttpCode(HttpStatus.OK)
  async getAirportStats(@Param('id') id: number) {
    try {
      return await this.airportService.getAirportStats(id);
    } catch (error: any) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   * 更新机场
   * PUT /api/airports/:id
   */
  @Put(':id')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.OK)
  async updateAirport(
    @Param('id') id: number,
    @Body() updateData: UpdateAirportDto,
  ) {
    try {
      const airport = await this.airportService.updateAirport(id, updateData);
      return {
        message: '更新成功',
        airport,
      };
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * 删除机场
   * DELETE /api/airports/:id
   */
  @Delete(':id')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.OK)
  async deleteAirport(@Param('id') id: number) {
    try {
      await this.airportService.deleteAirport(id);
      return { success: true, message: '删除成功' };
    } catch (error: any) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   * 批量删除机场
   * POST /api/airports/batch-delete
   */
  @Post('batch-delete')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.OK)
  async batchDeleteAirports(@Body() body: BatchDeleteAirportsDto) {
    const deletedCount = await this.airportService.batchDeleteAirports(body.ids);
    return {
      success: true,
      deletedCount,
      message: `成功删除 ${deletedCount} 个机场`,
    };
  }
}
