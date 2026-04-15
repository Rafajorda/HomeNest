import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';
import { ImagesProduct } from './images.entity';
import { Product } from '../product/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ImagesProduct, Product])],
  controllers: [ImagesController],
  providers: [ImagesService]
})
export class ImagesModule {}
