import { Body, Controller, Get, Post, Put, Delete, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Category } from './category.entity';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './category.dto';
import { AuthGuard } from '../auth/auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@ApiTags('category')
@Controller('category')
export class CategoryController {
   constructor(private readonly categoryService: CategoryService) {}


    @Get() 
       @ApiOperation({ summary: 'Obtener todas las categorías (público)' })
       async getCategories(): Promise<Category[]> {
        console.log('GET /category requested');
        return this.categoryService.getCategories();
      }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener categoría por ID (público)' })
    async getCategoryById(@Param('id', ParseUUIDPipe) id: string): Promise<Category | null> {
        return this.categoryService.getCategoryById(id);
    }

     @Post()
      @UseGuards(AuthGuard, AdminGuard)
      @ApiBearerAuth('JWT-auth')
      @ApiOperation({ summary: 'Crear nueva categoría (solo admin)' })
      createCategory(@Body() createCategoryDto: CreateCategoryDto) {
        console.log('BODY RECEIVED:', createCategoryDto);
        return this.categoryService.createCategory(createCategoryDto);
      }

    @Put(':id/toggle-status')
    @UseGuards(AuthGuard, AdminGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Cambiar estado active/inactive de categoría (solo admin)' })
    async toggleCategoryStatus(@Param('id', ParseUUIDPipe) id: string): Promise<Category> {
        return this.categoryService.toggleCategoryStatus(id);
    }

    @Put(':id')
    @UseGuards(AuthGuard, AdminGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Actualizar categoría (solo admin)' })
    updateCategory(@Param('id', ParseUUIDPipe) id: string, @Body() updateCategoryDto: CreateCategoryDto) {
        return this.categoryService.updateCategory(id, updateCategoryDto);
    }

    @Delete(':id')
    @UseGuards(AuthGuard, AdminGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Eliminar categoría (solo admin)' })
    async deleteCategory(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
        return this.categoryService.deleteCategory(id);
    }
    
}
