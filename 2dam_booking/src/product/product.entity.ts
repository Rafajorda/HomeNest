import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { Category } from '../category/category.entity';
import { OrderLine } from '../orderline/orderline.entity';
import { ImagesProduct } from '../images/images.entity';
import { Cart } from '../cart/cart.entity';
import { CartProduct } from '../cart/cartProduct.entity';
import { Favorites } from '../favorites/favorites.entity';
import { Color } from '../color/color.entity';




@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

    @Column()
    name: string;
    @Column()
    description: string;
    
    @Column()
    material: string;
    
     @Column('decimal', { precision: 10, scale: 2 })
    price: number; 
    @Column({ nullable: true })
    dimensions: string;
    @Column({ default: 0 })
    favoritesCount: number
    @Column({ default: 'active' })
    status: string;
    
    // Ruta del archivo .glb del modelo 3D (opcional)
    @Column({ type: 'varchar', length: 500, nullable: true })
    model3DPath?: string;
    
    @ManyToMany(() => Category, category => category.products)
    @JoinTable( { name: 'product_category', joinColumn: { name: 'product_id', referencedColumnName: 'id' }, inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' } })
        categories: Category[];
    
    @ManyToMany(() => Color, color => color.products)
    @JoinTable({ 
        name: 'product_color', 
        joinColumn: { name: 'product_id', referencedColumnName: 'id' }, 
        inverseJoinColumn: { name: 'color_id', referencedColumnName: 'id' } 
    })
    colors: Color[];
    
    @OneToMany(() => OrderLine, orderLine => orderLine.product)
        orderLines: OrderLine[];
    @OneToMany(() => ImagesProduct, images => images.product)
        images: ImagesProduct[];
    @ManyToMany(() => Cart, cart => cart.products)
        carts: Cart[];
    @OneToMany(() => CartProduct, cartProduct => cartProduct.product)
        cartProducts: CartProduct[];
    @OneToMany(() => Favorites, favorite => favorite.product)
        favorites: Favorites[];
    

}


