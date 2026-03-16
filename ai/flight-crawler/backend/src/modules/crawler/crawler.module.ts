import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrawlerService } from './crawler.service';
import { CrawlerController } from './crawler.controller';
import { FlightModule } from '../flight/flight.module';
import { CrawlerLog } from './entities/crawler-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CrawlerLog]),
    FlightModule,
  ],
  controllers: [CrawlerController],
  providers: [CrawlerService],
})
export class CrawlerModule {}
