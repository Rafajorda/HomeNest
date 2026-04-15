import { IsNumber, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderLineDto {
  @ApiProperty({
    example: 2,
    description: 'Cantidad de productos',
  })
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({
    example: 25.99,
    description: 'Precio del producto',
  })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty({
    example: 1,
    description: 'ID de la orden',
  })
  @IsNumber()
  @IsNotEmpty()
  orderId: number;

  @ApiProperty({
    example: 'uuid-product-123',
    description: 'ID del producto',
  })
  @IsString()
  @IsNotEmpty()
  productId: string;
}
