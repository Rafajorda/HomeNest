import { OrderLine } from '../orderline/orderline.entity';
import { User } from '../users/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';


@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;
    @Column({ nullable: true })
    slug: string;
    @Column('float')
    total: number
    @Column({ default: 'pending' })
    status: string;
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @ManyToOne(() => User, user => user.orders, { onDelete: 'CASCADE' })
    user: User;

    @OneToMany(() => OrderLine, orderLine => orderLine.order)
    orderLines: OrderLine[];
}



// model Order {
//   id         Int         @id @default(autoincrement())
//   slug       String
//   userId     Int
//   total      Float
//   status     status      @default(ACTIVE)
//   createdAt  DateTime    @default(now())
//   updatedAt  DateTime    @updatedAt
//   user       User        @relation(fields: [userId], references: [id], onDelete: Cascade)
//   orderLines OrderLine[]
// }
