import { IsString, IsNotEmpty, IsEmail, IsEnum, IsNumber, IsOptional, IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';


export class CreateProductDto {
  @ApiProperty({
    example: 'Silla de Madera',
    description: 'Nombre del producto',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Silla de madera maciza con acabado natural',
    description: 'Descripción detallada del producto',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: 'Madera',
    description: 'Material principal del producto',
  })
  @IsString()
  @IsNotEmpty()
  material: string;

  @ApiProperty({
    example: 149.99,
    description: 'Precio del producto',
  })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty({
    example: '80x60x40 cm',
    description: 'Dimensiones del producto (opcional)',
    required: false,
  })
  @IsString()
  @IsOptional()
  dimensions?: string;

  @ApiProperty({
    example: ['c6a5fbc8-2c64-4e47-9b25-1e9e9f43b2ef'],
    description: 'IDs de categorías asociadas al producto (opcional)',
    required: false,
    type: [String],
  })
  @IsArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  categoryIds?: string[];

  @ApiProperty({
    example: ['a1b2c3d4-5e6f-7g8h-9i0j-k1l2m3n4o5p6'],
    description: 'IDs de colores asociados al producto (opcional)',
    required: false,
    type: [String],
  })
  @IsArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  colorIds?: string[];
}

export class FilterProductDto {
  @ApiProperty({
    example: 'silla',
    description: 'Buscar por nombre o descripción del producto',
    required: false,
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({
    example: 'c6a5fbc8-2c64-4e47-9b25-1e9e9f43b2ef',
    description: 'Filtrar por ID de categoría',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({
    example: 'a1b2c3d4-5e6f-7g8h-9i0j-k1l2m3n4o5p6',
    description: 'Filtrar por ID de color',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  colorId?: string;

  @ApiProperty({
    example: 100,
    description: 'Precio mínimo',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  minPrice?: number;

  @ApiProperty({
    example: 500,
    description: 'Precio máximo',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  maxPrice?: number;

  @ApiProperty({
    example: true,
    description: 'Filtrar solo productos con modelo 3D disponible',
    required: false,
  })
  @IsOptional()
  hasModel3D?: boolean;

  @ApiProperty({
    example: 'active',
    description: 'Filtrar por estado del producto. Valores: "active" (activos), "inactive" (inactivos), "all" (todos). Por defecto: "active"',
    required: false,
    default: 'active',
  })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({
    example: 'price',
    description: 'Ordenar por: name, price, favoritesCount',
    required: false,
  })
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiProperty({
    example: 'ASC',
    description: 'Orden: ASC (ascendente) o DESC (descendente)',
    required: false,
  })
  @IsString()
  @IsOptional()
  order?: 'ASC' | 'DESC';

  @ApiProperty({
    example: true,
    description: 'Filtrar solo productos que están en favoritos del usuario (requiere autenticación)',
    required: false,
  })
  @IsOptional()
  onlyFavorites?: boolean;

  @ApiProperty({
    example: 10,
    description: 'Número de productos por página (máximo 100)',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiProperty({
    example: 0,
    description: 'Número de productos a saltar (para paginación)',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  offset?: number;
}

/**
 * DTO de respuesta con información del modelo 3D
 */
export class ProductResponseDto {
  @ApiProperty({
    example: 'c6a5fbc8-2c64-4e47-9b25-1e9e9f43b2ef',
    description: 'ID único del producto',
  })
  id: string;

  @ApiProperty({
    example: 'Silla Gaming Pro',
    description: 'Nombre del producto',
  })
  name: string;

  @ApiProperty({
    example: 'Silla ergonómica para gaming con soporte lumbar',
    description: 'Descripción del producto',
  })
  description: string;

  @ApiProperty({
    example: 299.99,
    description: 'Precio del producto',
  })
  price: number;

  @ApiProperty({
    example: 10,
    description: 'Stock disponible',
  })
  stock: number;

  @ApiProperty({
    example: 'Cuero sintético',
    description: 'Material del producto',
  })
  material: string;

  @ApiProperty({
    example: '120x60x50 cm',
    description: 'Dimensiones del producto',
    required: false,
  })
  dimensions?: string;

  @ApiProperty({
    example: true,
    description: 'Indica si el producto tiene modelo 3D disponible',
  })
  hasModel3D: boolean;

  @ApiProperty({
    example: 'http://localhost:3000/product/c6a5fbc8-2c64-4e47-9b25-1e9e9f43b2ef/model',
    description: 'URL completa para descargar el modelo 3D',
    required: false,
  })
  model3DUrl?: string;

  @ApiProperty({
    description: 'Imágenes del producto',
    type: 'array',
    items: { type: 'object' },
  })
  images?: any[];

  @ApiProperty({
    description: 'Categorías del producto',
    type: 'array',
    items: { type: 'object' },
  })
  categories?: any[];

  @ApiProperty({
    description: 'Colores disponibles del producto',
    type: 'array',
    items: { type: 'object' },
  })
  colors?: any[];

  @ApiProperty({
    example: 'active',
    description: 'Estado del producto',
  })
  status: string;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Fecha de creación',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Fecha de última actualización',
  })
  updatedAt: Date;
}

