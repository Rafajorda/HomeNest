
import { 
  Body, 
  Controller, 
  Get, 
  Param, 
  Post, 
  Put, 
  Delete, 
  Query, 
  UploadedFile, 
  UseInterceptors,
  Res,
  StreamableFile,
  BadRequestException,
  Req,
  ParseUUIDPipe,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { Product } from './product.entity';
import { CreateProductDto, FilterProductDto, ProductResponseDto } from './product.dto';
import type { Response, Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '../auth/auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@ApiTags('product')
@Controller('product')
export class ProductController {
    constructor(
      private readonly productService: ProductService,
      private readonly jwtService: JwtService,
    ) {}

 @Get() 
   @ApiOperation({ summary: 'Obtener productos con filtros' })
   @ApiQuery({ name: 'search', required: false, description: 'Buscar por nombre o descripción' })
   @ApiQuery({ name: 'categoryId', required: false, description: 'Filtrar por ID de categoría' })
   @ApiQuery({ name: 'colorId', required: false, description: 'Filtrar por ID de color' })
   @ApiQuery({ name: 'minPrice', required: false, description: 'Precio mínimo' })
   @ApiQuery({ name: 'maxPrice', required: false, description: 'Precio máximo' })
   @ApiQuery({ name: 'onlyFavorites', required: false, description: 'Solo productos en favoritos del usuario (requiere autenticación)' })
   @ApiQuery({ name: 'sortBy', required: false, description: 'Ordenar por (name, price, favoritesCount)' })
   @ApiQuery({ name: 'order', required: false, enum: ['ASC', 'DESC'], description: 'Orden ascendente o descendente' })
   @ApiQuery({ name: 'limit', required: false, description: 'Número de resultados' })
   @ApiQuery({ name: 'offset', required: false, description: 'Saltar resultados' })
   @ApiBearerAuth('JWT-auth')
   async getProducts(
    @Req() req: Request,
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('colorId') colorId?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('onlyFavorites') onlyFavorites?: string,
    @Query('sortBy') sortBy?: string,
    @Query('order') order?: 'ASC' | 'DESC',
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
   ) {
    console.log('GET /product requested with filters');
    
    // Validar números si están presentes
    if (minPrice && isNaN(Number(minPrice))) {
      throw new BadRequestException('minPrice debe ser un número válido');
    }
    if (maxPrice && isNaN(Number(maxPrice))) {
      throw new BadRequestException('maxPrice debe ser un número válido');
    }
    if (limit && isNaN(Number(limit))) {
      throw new BadRequestException('limit debe ser un número válido');
    }
    if (offset && isNaN(Number(offset))) {
      throw new BadRequestException('offset debe ser un número válido');
    }

    // Obtener userId del token JWT si está presente
    let userId: number | undefined;
    const onlyFavoritesBoolean = onlyFavorites === 'true';

    if (onlyFavoritesBoolean) {
      const token = this.extractTokenFromHeader(req);
      if (!token) {
        throw new UnauthorizedException('Se requiere autenticación para filtrar por favoritos');
      }

      try {
        const payload = await this.jwtService.verifyAsync(token, {
          secret: process.env.JWT_SECRET || 'tu_secreto_super_seguro_cambialo',
        });
        userId = payload.sub;
      } catch {
        throw new UnauthorizedException('Token inválido o expirado');
      }
    }
    
    const filters: FilterProductDto = {
      search,
      categoryId,
      colorId,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      onlyFavorites: onlyFavoritesBoolean,
      sortBy,
      order,
      limit: limit ? Number(limit) : 10,
      offset: offset ? Number(offset) : 0,
    };

    const result = await this.productService.getProducts(filters, userId);
    return result;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener producto por ID (público)' })
  async getProductById(@Param('id', ParseUUIDPipe) id: string): Promise<Product | null> {
    return this.productService.getProductById(id);
  }

  /**
   * Obtiene un producto con información del modelo 3D
   * GET /product/:id/details
   * 
   * Este endpoint retorna el producto con información adicional sobre el modelo 3D:
   * - hasModel3D: true/false
   * - model3DUrl: URL completa para descargar el modelo
   * 
   * Ejemplo de respuesta:
   * {
   *   "id": "abc123",
   *   "name": "Silla Gaming",
   *   "price": 299.99,
   *   "hasModel3D": true,
   *   "model3DUrl": "http://localhost:3000/product/abc123/model"
   * }
   * 
   * El frontend puede usar model3DUrl directamente en ModelViewer:
   * ModelViewer(src: product.model3DUrl)
   */
  @Get(':id/details')
  @ApiOperation({ summary: 'Obtener producto con detalles de modelo 3D (público)' })
  async getProductDetails(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ): Promise<ProductResponseDto> {
    const product = await this.productService.getProductById(id);
    
    // Obtener la URL base del servidor
    const protocol = req.protocol;
    const host = req.get('host');
    const baseUrl = `${protocol}://${host}`;
    
    return this.productService.toResponseDto(product, baseUrl);
  }

  @Post()
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Crear nuevo producto (solo admin)' })
  createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productService.createProduct(createProductDto);
  }

  @Put(':id')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Actualizar producto (solo admin)' })
  updateProduct(@Param('id', ParseUUIDPipe) id: string, @Body() updateProductDto: CreateProductDto) {
    return this.productService.updateProduct(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Eliminar producto (solo admin)' })
  async deleteProduct(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.productService.deleteProduct(id);
  }

  @Put(':id/toggle-status')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Cambiar estado de producto (active/inactive) (solo admin)' })
  async toggleProductStatus(@Param('id', ParseUUIDPipe) id: string): Promise<Product> {
    return this.productService.toggleProductStatus(id);
  }

  /**
   * Sube o actualiza el modelo 3D de un producto
   * POST /product/:id/model
   */
  @Post(':id/model')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Subir modelo 3D para un producto (solo admin)' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadModel3D(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: any,
  ): Promise<{ message: string; product: Product }> {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    const product = await this.productService.updateModel3D(
      id,
      file.buffer,
      file.originalname,
    );

    return {
      message: 'Modelo 3D subido correctamente',
      product,
    };
  }

  /**
   * Descarga el modelo 3D de un producto
   * GET /product/:id/model
   */
  @Get(':id/model')
  @ApiOperation({ summary: 'Descargar modelo 3D de un producto (público)' })
  async getModel3D(
    @Param('id', ParseUUIDPipe) id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const buffer = await this.productService.getModel3D(id);

    res.set({
      'Content-Type': 'model/gltf-binary',
      'Content-Disposition': `attachment; filename="product-${id}.glb"`,
    });

    return new StreamableFile(buffer);
  }

  /**
   * Elimina el modelo 3D de un producto
   * DELETE /product/:id/model
   */
  @Delete(':id/model')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Eliminar modelo 3D de un producto (solo admin)' })
  async deleteModel3D(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string; product: Product }> {
    const product = await this.productService.deleteModel3D(id);

    return {
      message: 'Modelo 3D eliminado correctamente',
      product,
    };
  }

  /**
   * Verifica si un producto tiene modelo 3D
   * GET /product/:id/has-model
   */
  @Get(':id/has-model')
  @ApiOperation({ summary: 'Verificar si un producto tiene modelo 3D' })
  async hasModel3D(@Param('id', ParseUUIDPipe) id: string): Promise<{ hasModel: boolean }> {
    const hasModel = await this.productService.hasModel3D(id);
    return { hasModel };
  }
}
