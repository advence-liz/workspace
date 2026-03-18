import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('flights')
@Index(['origin', 'destination', 'departureTime'])
@Index(['crawledAt'])
@Index(['flightNo', 'origin', 'destination', 'departureTime', 'cardType'], { unique: true })
export class Flight {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  flightNo: string;

  @Column()
  origin: string;

  @Column()
  destination: string;

  @Column({ type: 'datetime' })
  departureTime: Date;

  @Column({ type: 'datetime' })
  arrivalTime: Date;

  @Column({ nullable: true })
  availableSeats: number;

  @Column({ nullable: true })
  aircraftType: string;

  @Column({ default: '全部' })
  cardType: string; // 666权益卡/2666权益卡/全部

  @Column({ type: 'datetime' })
  crawledAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
