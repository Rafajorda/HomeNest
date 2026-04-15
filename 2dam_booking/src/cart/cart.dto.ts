import { IsNumber, IsNotEmpty, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCartDto {
  @ApiProperty({
    example: 100.50,
    description: 'Total del carrito',
  })
  @IsNumber()
  @IsNotEmpty()
  total: number;

  @ApiProperty({
    example: [1, 2, 3],
    description: 'IDs de productos en el carrito',
    required: false,
  })
  @IsArray()
  @IsOptional()
  productIds?: string[];
}
