import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorites } from './favorites.entity';
import { CreateFavoriteDto } from './favorites.dto';
import { User } from '../users/user.entity';
import { Product } from '../product/product.entity';

@Injectable()
export class FavoritesService {
    constructor(
        @InjectRepository(Favorites)
        private favoritesRepository: Repository<Favorites>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
    ) {}

    // ==================== MÉTODOS CON AUTENTICACIÓN ====================
    
    /**
     * Obtener todos los favoritos del usuario autenticado
     */
    async getFavoritesByUser(userId: number): Promise<Favorites[]> {
        return this.favoritesRepository.find({
            where: { user: { id: userId } },
            relations: ['product', 'product.images', 'product.colors', 'product.categories'],
        });
    }

    /**
     * Obtener un favorito por ID (solo si pertenece al usuario)
     */
    async getFavoriteById(id: number, userId: number): Promise<Favorites | null> {
        const favorite = await this.favoritesRepository.findOne({
            where: { id, user: { id: userId } },
            relations: ['product', 'product.images', 'product.colors', 'product.categories'],
        });

        if (!favorite) {
            throw new NotFoundException('Favorito no encontrado');
        }

        return favorite;
    }

    /**
     * Crear un nuevo favorito para el usuario autenticado
     */
    async createFavorite(userId: number, createFavoriteDto: CreateFavoriteDto) {
        // Verificar que el producto existe
        const product = await this.productRepository.findOne({
            where: { id: createFavoriteDto.productId },
        });

        if (!product) {
            throw new NotFoundException('Producto no encontrado');
        }

        // Verificar si ya está en favoritos
        const existingFavorite = await this.favoritesRepository.findOne({
            where: {
                user: { id: userId },
                product: { id: createFavoriteDto.productId },
            },
        });

        if (existingFavorite) {
            throw new ConflictException('El producto ya está en favoritos');
        }

        // Obtener el usuario
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }
        
        // Crear el favorito
        const favorite = this.favoritesRepository.create({
            user,
            product,
        });

        await this.favoritesRepository.save(favorite);
        
        // Incrementar el contador de favoritos del producto
        product.favoritesCount = (product.favoritesCount || 0) + 1;
        await this.productRepository.save(product);
        
        // Retornar con relaciones
        return this.favoritesRepository.findOne({
            where: { id: favorite.id },
            relations: ['product', 'product.images', 'product.colors', 'product.categories'],
        });
    }

    /**
     * Eliminar un favorito (solo si pertenece al usuario)
     */
    async deleteFavorite(id: number, userId: number): Promise<void> {
        const favorite = await this.favoritesRepository.findOne({
            where: { id, user: { id: userId } },
            relations: ['product'],
        });

        if (!favorite) {
            throw new NotFoundException('Favorito no encontrado');
        }

        // Decrementar el contador de favoritos del producto
        if (favorite.product) {
            favorite.product.favoritesCount = Math.max(0, (favorite.product.favoritesCount || 0) - 1);
            await this.productRepository.save(favorite.product);
        }

        await this.favoritesRepository.remove(favorite);
    }

    /**
     * Eliminar un favorito por productId (alternativa más común)
     */
    async removeFromFavorites(userId: number, productId: string) {
        const favorite = await this.favoritesRepository.findOne({
            where: {
                user: { id: userId },
                product: { id: productId },
            },
            relations: ['product'],
        });

        if (!favorite) {
            throw new NotFoundException('Producto no encontrado en favoritos');
        }

        // Decrementar el contador de favoritos del producto
        if (favorite.product) {
            favorite.product.favoritesCount = Math.max(0, (favorite.product.favoritesCount || 0) - 1);
            await this.productRepository.save(favorite.product);
        }

        await this.favoritesRepository.remove(favorite);
        return { message: 'Producto eliminado de favoritos' };
    }

    /**
     * Verificar si un producto está en favoritos del usuario
     */
    async isFavorite(userId: number, productId: string): Promise<boolean> {
        const favorite = await this.favoritesRepository.findOne({
            where: {
                user: { id: userId },
                product: { id: productId },
            },
        });

        return !!favorite;
    }
}
