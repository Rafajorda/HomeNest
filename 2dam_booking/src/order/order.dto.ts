import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({
    example: 'order-123',
    description: 'Slug único de la orden (se genera automáticamente si no se proporciona)',
    required: false,
  })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({
    example: 1,
    description: 'ID del usuario',
  })
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({
    example: 150.50,
    description: 'Total de la orden',
  })
  @IsNumber()
  @IsNotEmpty()
  total: number;
}

export class UpdateOrderDto {
  @ApiProperty({
    example: 'completed',
    description: 'Estado de la orden (pending, processing, shipped, completed, cancelled)',
    required: false,
  })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({
    example: 150.50,
    description: 'Total de la orden',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  total?: number;
}
