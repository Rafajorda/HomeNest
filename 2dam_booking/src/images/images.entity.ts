
    // model ImagesProduct {
    //   id        Int      @id @default(autoincrement())
    //   src       String
    //   alt       String
    //   productId Int
    //   status    status   @default(ACTIVE)
    //   createdAt DateTime @default(now())
    //   updatedAt DateTime @updatedAt
    //   product   Product  @relation(fields: [productId], references: [id])
    // }
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Product } from '../product/product.entity';

@Entity()
export class ImagesProduct {
  @PrimaryGeneratedColumn()
  id: number;
    @Column()
    src: string;
    @Column()
    alt: string;
    @Column({ default: 'active' })
    status: string;
    @ManyToOne(() => Product, product => product.images)
    product: Product;
}

