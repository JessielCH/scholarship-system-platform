import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sagaId: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column()
  destinationAccount: string;

  @Column({ default: 'PENDING' })
  status: string; // PENDING, COMPLETED, FAILED, REJECTED

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
