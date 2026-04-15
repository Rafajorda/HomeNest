import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { Product } from './product.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryModule } from 'src/category/category.module';
import { ColorModule } from 'src/color/color.module';
import { FileConverterModule } from '../common/services/file-converter.module';

@Module({
   imports: [
    TypeOrmModule.forFeature([Product]),
    CategoryModule,
    ColorModule,
    FileConverterModule,
  ],
  providers: [ProductService],
  controllers: [ProductController]
})
export class ProductModule {}
