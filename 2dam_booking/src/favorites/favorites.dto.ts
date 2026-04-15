import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFavoriteDto {
  @ApiProperty({
    example: 'uuid-product-123',
    description: 'ID del producto',
  })
  @IsString()
  @IsNotEmpty()
  productId: string;
}
