import { Body, Controller, Get, Post, Put, Delete, Param, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { Favorites } from './favorites.entity';
import { CreateFavoriteDto } from './favorites.dto';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('favorites')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard)
@Controller('favorites')
export class FavoritesController {
    constructor(private readonly favoritesService: FavoritesService) {}

    @Get()
    @ApiOperation({ summary: 'Obtener todos los favoritos del usuario autenticado' })
    async getFavorites(@Request() req): Promise<Favorites[]> {
        const userId = req.user.sub;
        console.log('GET /favorites requested for user:', userId);
        return this.favoritesService.getFavoritesByUser(userId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener un favorito por ID' })
    async getFavoriteById(@Param('id', ParseIntPipe) id: number, @Request() req): Promise<Favorites | null> {
        const userId = req.user.sub;
        return this.favoritesService.getFavoriteById(id, userId);
    }

    @Post()
    @ApiOperation({ summary: 'Crear un nuevo favorito' })
    createFavorite(@Body() createFavoriteDto: CreateFavoriteDto, @Request() req) {
        const userId = req.user.sub;
        return this.favoritesService.createFavorite(userId, createFavoriteDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar un favorito' })
    async deleteFavorite(@Param('id', ParseIntPipe) id: number, @Request() req): Promise<void> {
        const userId = req.user.sub;
        return this.favoritesService.deleteFavorite(id, userId);
    }

    @Get('check/:productId')
    @ApiOperation({ summary: 'Verificar si un producto está en favoritos' })
    async checkFavorite(@Param('productId') productId: string, @Request() req): Promise<{ isFavorite: boolean }> {
        const userId = req.user.sub;
        const isFavorite = await this.favoritesService.isFavorite(userId, productId);
        return { isFavorite };
    }
}
