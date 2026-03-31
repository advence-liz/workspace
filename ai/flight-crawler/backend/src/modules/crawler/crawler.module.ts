import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrawlerController } from './crawler.controller';
import { FlightModule } from '../flight/flight.module';
import { RouteModule } from '../route/route.module';
import { CrawlerLog } from './entities/crawler-log.entity';
import { CrawlerServiceStub } from './crawler.service.stub';

const crawlerEnabled = process.env.CRAWLER_ENABLED !== 'false';

// 动态决定注入哪个实现
// eslint-disable-next-line @typescript-eslint/no-require-imports
const CrawlerServiceImpl = crawlerEnabled ? require('./crawler.service').CrawlerService : CrawlerServiceStub;

@Module({
  imports: [
    TypeOrmModule.forFeature([CrawlerLog]),
    FlightModule,
    RouteModule,
  ],
  controllers: [CrawlerController],
  providers: [
    {
      provide: 'CrawlerService',
      useClass: CrawlerServiceImpl,
    },
  ],
})
export class CrawlerModule {}
