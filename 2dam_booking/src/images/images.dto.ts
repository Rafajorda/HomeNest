import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateImageDto {
  @ApiProperty({
    example: 'https://example.com/image.jpg',
    description: 'URL de la imagen',
  })
  @IsString()
  @IsNotEmpty()
  src: string;

  @ApiProperty({
    example: 'Descripción de la imagen',
    description: 'Texto alternativo',
  })
  @IsString()
  @IsNotEmpty()
  alt: string;

  @ApiProperty({
    example: 'uuid-product-123',
    description: 'ID del producto',
  })
  @IsString()
  @IsNotEmpty()
  productId: string;
}
