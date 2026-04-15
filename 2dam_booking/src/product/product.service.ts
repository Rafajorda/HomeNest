import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateProductDto, FilterProductDto, ProductResponseDto } from './product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import {Product} from './product.entity'
import { In, Repository, Like, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Category } from '../category/category.entity'; 
import { Color } from '../color/color.entity';
import { FileConverterService } from '../common/services/file-converter.service';

@Injectable()
export class ProductService {
    categoryIds?: string[];
 constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Color)
    private colorRepository: Repository<Color>,
    private fileConverterService: FileConverterService,
    ) {}

    /**
     * Convierte un Product entity a ProductResponseDto con información del modelo 3D
     * @param product Entidad del producto
     * @param baseUrl URL base de la aplicación (ej: http://localhost:3000)
     * @returns ProductResponseDto
     */
    toResponseDto(product: Product, baseUrl: string = 'http://localhost:3000'): ProductResponseDto {
        const hasModel3D = !!product.model3DPath;
        
        return {
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            stock: 0, 
            material: product.material, 
            dimensions: product.dimensions,
            hasModel3D,
            model3DUrl: hasModel3D ? `${baseUrl}/product/${product.id}/model` : undefined,
            images: product.images,
            categories: product.categories,
            colors: product.colors,
            status: product.status,
            createdAt: new Date(), 
            updatedAt: new Date(), 
        };
    }
    
    
    async getProducts(filters?: FilterProductDto, userId?: number): Promise<{ data: Product[], total: number }> {
        const queryBuilder = this.productRepository.createQueryBuilder('product')
            .leftJoinAndSelect('product.categories', 'category')
            .leftJoinAndSelect('product.colors', 'color')
            .leftJoinAndSelect('product.images', 'images');

        // Filtro por favoritos del usuario
        if (filters?.onlyFavorites && userId) {
            queryBuilder
                .innerJoin('product.favorites', 'favorite')
                .andWhere('favorite.user.id = :userId', { userId });
        }

        // Filtro por búsqueda (nombre o descripción)
        if (filters?.search) {
            queryBuilder.andWhere(
                '(product.name LIKE :search OR product.description LIKE :search)',
                { search: `%${filters.search}%` }
            );
        }

        // Filtro por categoría
        if (filters?.categoryId) {
            queryBuilder.andWhere('category.id = :categoryId', { categoryId: filters.categoryId });
        }

        // Filtro por color
        if (filters?.colorId) {
            queryBuilder.andWhere('color.id = :colorId', { colorId: filters.colorId });
        }

        // Filtro por rango de precios
        if (filters?.minPrice !== undefined && filters?.maxPrice !== undefined) {
            queryBuilder.andWhere('product.price BETWEEN :minPrice AND :maxPrice', {
                minPrice: filters.minPrice,
                maxPrice: filters.maxPrice
            });
        } else if (filters?.minPrice !== undefined) {
            queryBuilder.andWhere('product.price >= :minPrice', { minPrice: filters.minPrice });
        } else if (filters?.maxPrice !== undefined) {
            queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice: filters.maxPrice });
        }

        // Filtro por modelo 3D (nuevo)
        if (filters?.hasModel3D !== undefined) {
            if (filters.hasModel3D) {
                queryBuilder.andWhere('product.model3DPath IS NOT NULL');
            } else {
                queryBuilder.andWhere('product.model3DPath IS NULL');
            }
        }

        // Filtro por estado - Si no se especifica, mostrar todos
        if (filters?.status && filters.status !== 'all') {
            queryBuilder.andWhere('product.status = :status', { status: filters.status });
        }

        // Ordenamiento
        const sortBy = filters?.sortBy || 'name';
        const order = filters?.order || 'ASC';
        
        if (sortBy === 'name') {
            queryBuilder.orderBy('product.name', order);
        } else if (sortBy === 'price') {
            queryBuilder.orderBy('product.price', order);
        } else if (sortBy === 'favoritesCount') {
            queryBuilder.orderBy('product.favoritesCount', order);
        }

      
        const limit = Math.min(filters?.limit || 10, 100); 
        const offset = filters?.offset || 0;
        queryBuilder.skip(offset).take(limit);

        // Obtener resultados y total
        const [data, total] = await queryBuilder.getManyAndCount();

        return { data, total };
    }
    
    async getProductById(id: string): Promise<Product> {
        const product = await this.productRepository.findOne({
            where: { id },
            relations: ['categories', 'colors', 'images'],
        });

        if (!product) {
            throw new NotFoundException(`Producto con ID "${id}" no encontrado`);
        }

        return product;
    }

    async createProduct(createProductDto: CreateProductDto) {
        const { categoryIds, colorIds, ...productData } = createProductDto;
        
        const product = this.productRepository.create({
            ...productData,
        });

        if (categoryIds?.length) {
            const categories = await this.categoryRepository.find({
                where: { id: In(categoryIds) },
            });

            if (categories.length !== categoryIds.length) {
                throw new BadRequestException('Una o más categorías no existen');
            }

            product.categories = categories;
        }

        if (colorIds?.length) {
            const colors = await this.colorRepository.find({
                where: { id: In(colorIds) },
            });

            if (colors.length !== colorIds.length) {
                throw new BadRequestException('Uno o más colores no existen');
            }

            product.colors = colors;
        }

        await this.productRepository.save(product);
        return product;
    }

    async updateProduct(id: string, updateProductDto: CreateProductDto) {
        const product = await this.productRepository.findOne({
            where: { id },
            relations: ['categories', 'colors'],
        });

        if (!product) {
            throw new NotFoundException(`Producto con ID "${id}" no encontrado`);
        }

        const { categoryIds, colorIds, ...productData } = updateProductDto;

        Object.assign(product, productData);

        if (categoryIds?.length) {
            const categories = await this.categoryRepository.find({
                where: { id: In(categoryIds) },
            });

            if (categories.length !== categoryIds.length) {
                throw new BadRequestException('Una o más categorías no existen');
            }

            product.categories = categories;
        }

        if (colorIds?.length) {
            const colors = await this.colorRepository.find({
                where: { id: In(colorIds) },
            });

            if (colors.length !== colorIds.length) {
                throw new BadRequestException('Uno o más colores no existen');
            }

            product.colors = colors;
        }

        await this.productRepository.save(product);
        return product;
    }

    async deleteProduct(id: string): Promise<void> {
        // Obtener el producto para eliminar su modelo 3D si existe
        const product = await this.productRepository.findOne({ where: { id } });
        
        if (!product) {
            throw new NotFoundException(`Producto con ID "${id}" no encontrado`);
        }

        // Eliminar el modelo 3D si existe
        if (product.model3DPath) {
            await this.fileConverterService.deleteGlbFile(product.model3DPath);
        }

        const result = await this.productRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Producto con ID "${id}" no encontrado`);
        }
    }

    async toggleProductStatus(id: string): Promise<Product> {
        const product = await this.productRepository.findOne({
            where: { id },
            relations: ['categories', 'colors', 'images'],
        });

        if (!product) {
            throw new NotFoundException(`Producto con ID "${id}" no encontrado`);
        }

        // Cambiar el estado
        product.status = product.status === 'active' ? 'inactive' : 'active';

        await this.productRepository.save(product);
        return product;
    }

    /**
     * Agrega o actualiza el modelo 3D de un producto
     * @param id ID del producto
     * @param file Buffer del archivo .glb
     * @returns Producto actualizado
     */
    async updateModel3D(id: string, file: Buffer, originalName: string): Promise<Product> {
        // Validar extensión
        this.fileConverterService.validateGlbExtension(originalName);
        
        // Validar tamaño (máximo 50MB)
        this.fileConverterService.validateFileSize(file, 50);

        const product = await this.productRepository.findOne({ where: { id } });

        if (!product) {
            throw new NotFoundException(`Producto con ID "${id}" no encontrado`);
        }

        // Si ya tiene un modelo 3D, eliminar el anterior
        if (product.model3DPath) {
            await this.fileConverterService.deleteGlbFile(product.model3DPath);
        }

        // Guardar el nuevo modelo
        const filePath = await this.fileConverterService.saveGlbFile(file, id);
        
        // Actualizar la ruta en el producto
        product.model3DPath = filePath;
        await this.productRepository.save(product);

        return product;
    }

    /**
     * Obtiene el archivo .glb del modelo 3D de un producto
     * @param id ID del producto
     * @returns Buffer del archivo
     */
    async getModel3D(id: string): Promise<Buffer> {
        const product = await this.productRepository.findOne({ where: { id } });

        if (!product) {
            throw new NotFoundException(`Producto con ID "${id}" no encontrado`);
        }

        if (!product.model3DPath) {
            throw new NotFoundException(`El producto no tiene modelo 3D`);
        }

        return this.fileConverterService.readGlbFile(product.model3DPath);
    }

    /**
     * Elimina el modelo 3D de un producto
     * @param id ID del producto
     * @returns Producto actualizado
     */
    async deleteModel3D(id: string): Promise<Product> {
        const product = await this.productRepository.findOne({ where: { id } });

        if (!product) {
            throw new NotFoundException(`Producto con ID "${id}" no encontrado`);
        }

        if (!product.model3DPath) {
            throw new NotFoundException(`El producto no tiene modelo 3D`);
        }

        // Eliminar el archivo
        await this.fileConverterService.deleteGlbFile(product.model3DPath);
        
        // Actualizar el producto
        product.model3DPath = undefined;
        await this.productRepository.save(product);

        return product;
    }

    /**
     * Verifica si un producto tiene modelo 3D
     * @param id ID del producto
     * @returns true si tiene modelo 3D, false si no
     */
    async hasModel3D(id: string): Promise<boolean> {
        const product = await this.productRepository.findOne({ 
            where: { id },
            select: ['id', 'model3DPath']
        });

        if (!product) {
            throw new NotFoundException(`Producto con ID "${id}" no encontrado`);
        }

        return !!product.model3DPath && this.fileConverterService.fileExists(product.model3DPath);
    }
  
}

