import { Product } from '../product/product.entity';
import { User } from '../users/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, OneToMany, ManyToOne } from 'typeorm';





@Entity()
export class Favorites  {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.favorites)
  user: User;

  @ManyToOne(() => Product, product => product.favorites)
  product: Product;

}

