import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum CrawlerTaskType {
  DISCOVER_AIRPORTS = 'discover_airports',
  REFRESH_FLIGHTS = 'refresh_flights',
  FULL_INITIALIZE = 'full_initialize',
}

export enum CrawlerTaskStatus {
  RUNNING = 'running',
  SUCCESS = 'success',
  FAILED = 'failed',
}

@Entity('crawler_logs')
@Index(['taskType', 'createdAt'])
@Index(['status', 'createdAt'])
export class CrawlerLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 50,
  })
  taskType: CrawlerTaskType;

  @Column({
    type: 'varchar',
    length: 20,
  })
  status: CrawlerTaskStatus;

  @Column({ type: 'int', nullable: true })
  days: number; // 爬取天数

  @Column({ type: 'int', default: 0 })
  airportCount: number; // 发现的机场数量

  @Column({ type: 'int', default: 0 })
  flightCount: number; // 爬取的航班数量

  @Column({ type: 'text', nullable: true })
  details: string; // JSON 格式的详细信息

  @Column({ type: 'text', nullable: true })
  errorMessage: string; // 错误信息

  @Column({ type: 'datetime', nullable: true })
  startTime: Date; // 开始时间

  @Column({ type: 'datetime', nullable: true })
  endTime: Date; // 结束时间

  @Column({ type: 'int', nullable: true })
  duration: number; // 执行时长（秒）

  @CreateDateColumn()
  createdAt: Date;
}
