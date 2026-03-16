import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { FlightModule } from './modules/flight/flight.module';
import { CrawlerModule } from './modules/crawler/crawler.module';
import { RouteModule } from './modules/route/route.module';
import { winstonConfig } from './config/logger.config';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Winston 日志模块
    WinstonModule.forRoot(winstonConfig),

    // 数据库模块
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.DB_DATABASE || './data/flight-crawler.db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // 生产环境应设为 false
      logging: process.env.NODE_ENV === 'development',
    }),

    // 定时任务模块
    ScheduleModule.forRoot(),

    // 业务模块
    FlightModule,
    CrawlerModule,
    RouteModule,
  ],
})
export class AppModule {}
