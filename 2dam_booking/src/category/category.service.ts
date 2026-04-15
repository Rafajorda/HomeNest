import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { CreateCategoryDto } from './category.dto';

@Injectable()
export class CategoryService {

 constructor(

    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    ) {}


    getCategories(): Promise<Category[]> {
        return this.categoryRepository.find();
    }

    async getCategoryById(id: string): Promise<Category> {
        const category = await this.categoryRepository.findOne({
            where: { id },
        });

        if (!category) {
            throw new NotFoundException(`Categoría con ID "${id}" no encontrada`);
        }

        return category;
    }

    async createCategory(createCategoryDto: CreateCategoryDto) {
        const category = this.categoryRepository.create({
            ...createCategoryDto,
        });
        await this.categoryRepository.save(category);
        return category;
    }

    async updateCategory(id: string, updateCategoryDto: CreateCategoryDto) {
        const category = await this.categoryRepository.findOne({
            where: { id },
        });

        if (!category) {
            throw new NotFoundException(`Categoría con ID "${id}" no encontrada`);
        }

        Object.assign(category, updateCategoryDto);
        await this.categoryRepository.save(category);
        return category;
    }

    async deleteCategory(id: string): Promise<void> {
        const result = await this.categoryRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Categoría con ID "${id}" no encontrada`);
        }
    }

    async toggleCategoryStatus(id: string): Promise<Category> {
        const category = await this.categoryRepository.findOne({
            where: { id },
        });

        if (!category) {
            throw new NotFoundException(`Categoría con ID "${id}" no encontrada`);
        }

        category.status = category.status === 'active' ? 'inactive' : 'active';
        await this.categoryRepository.save(category);
        return category;
    }
}
