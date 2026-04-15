
import { Product } from '../product/product.entity';
import { User } from '../users/user.entity';
import { CartProduct } from './cartProduct.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, OneToOne, OneToMany, JoinTable, JoinColumn } from 'typeorm';


@Entity()
export class Cart {
  @PrimaryGeneratedColumn()
  id: number;

    @Column({ type: 'float', default: 0 })
    total: number;

    @Column({ default: 'active' })
    status: string;
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @OneToOne(() => User, user => user.cart, { onDelete: 'CASCADE' })
    @JoinColumn()
    user: User;

    @ManyToMany(() => Product, (product) => product.carts)
    @JoinTable()
        products: Product[];

    @OneToMany(() => CartProduct, cartProduct => cartProduct.cart)
    cartProducts: CartProduct[];
}



