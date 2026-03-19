import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class Invoice {
  @PrimaryColumn()
  id: string;

  @Column('decimal')
  amount: number;

  @Column()
  description: string;

  @Column()
  status: string;

  @Column()
  createdAt: string;
}
