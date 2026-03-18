import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum CrawlerTaskType {
  DISCOVER_AIRPORTS = 'discover_airports',
  REFRESH_FLIGHTS = 'refresh_flights',         // 父任务：发现航班（整体）
  REFRESH_FLIGHTS_DAILY = 'refresh_flights_daily', // 子任务：单日航班爬取
  FULL_INITIALIZE = 'full_initialize',
}

export enum CrawlerTaskStatus {
  PENDING = 'pending',   // 等待执行（已预创建，尚未启动）
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
  parentId: number | null; // 父任务 ID（子任务专用，父任务为 null）

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
