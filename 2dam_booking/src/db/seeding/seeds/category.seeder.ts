import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { Category } from '../../../category/category.entity';
import { categoriesData } from '../../../data/categories';

export class CategorySeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const categoryRepository = dataSource.getRepository(Category);
    
    console.log('🌱 Seeding categories...');
    
    for (const categoryData of categoriesData) {
      const existingCategory = await categoryRepository.findOne({
        where: { name: categoryData.name },
      });

      if (!existingCategory) {
        const category = categoryRepository.create(categoryData);
        await categoryRepository.save(category);
        console.log(`✅ Category created: ${category.name}`);
      } else {
        console.log(`⏭️  Category already exists: ${categoryData.name}`);
      }
    }
    
    console.log('✅ Categories seeding completed!');
  }
}
