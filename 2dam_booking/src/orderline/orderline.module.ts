import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderlineController } from './orderline.controller';
import { OrderlineService } from './orderline.service';
import { OrderLine } from './orderline.entity';
import { Order } from '../order/order.entity';
import { Product } from '../product/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrderLine, Order, Product])],
  controllers: [OrderlineController],
  providers: [OrderlineService]
})
export class OrderlineModule {}
