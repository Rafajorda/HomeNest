import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from '../order/order.entity';
import { Product } from '../product/product.entity';

@Entity()
export class OrderLine {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  quantity: number;

  @Column('float')
  price: number;

  @Column({ default: 'active' })
  status: string;

  // 🔁 Many OrderLines belong to one Order
@ManyToOne(() => Order, order => order.orderLines)
@JoinColumn({ name: 'orderId' }) // optional: specify the FK column name
order: Order;

  // 🔁 Many OrderLines refer to one Product
  @ManyToOne(() => Product, product => product.orderLines, { eager: true })
  @JoinColumn({ name: 'productId' }) 
  product: Product;
}

// model OrderLine {
//   id             Int          @id @default(autoincrement())
//   orderId        Int
//   productPriceId Int
//   quantity       Int
//   price          Float
//   status         status       @default(ACTIVE)
//   createdAt      DateTime     @default(now())
//   updatedAt      DateTime     @updatedAt
//   order          Order        @relation(fields: [orderId], references: [id], onDelete: Cascade)
//   productprice   ProductPrice @relation(fields: [productPriceId], references: [id])
