import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

/**
 * 机场实体
 * 用于存储自动发现的机场信息
 */
@Entity('airports')
@Index(['city', 'enableCrawl']) // expandCityToAirports 的高频查询
export class Airport {
  @PrimaryGeneratedColumn()
  id: number;

  /** 完整机场名称（如：北京首都、上海虹桥） */
  @Column({ unique: true })
  name: string;

  /** 城市名称（如：北京、上海） */
  @Column()
  city: string;

  /** 是否启用爬虫（自动发现的机场默认启用，所有机场都可作为出发地或目的地） */
  @Column({ default: true })
  enableCrawl: boolean;

  /** 发现时间 */
  @CreateDateColumn()
  discoveredAt: Date;

  /** 最后更新时间 */
  @UpdateDateColumn()
  updatedAt: Date;
}
