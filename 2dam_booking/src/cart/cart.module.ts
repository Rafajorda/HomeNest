import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { Cart } from './cart.entity';
import { CartProduct } from './cartProduct.entity';
import { Product } from '../product/product.entity';
import { User } from '../users/user.entity';
import { Order } from '../order/order.entity';
import { OrderLine } from '../orderline/orderline.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cart, CartProduct, Product, User, Order, OrderLine])],
  providers: [CartService],
  controllers: [CartController],
  exports: [CartService],
})
export class CartModule {}
