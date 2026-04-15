import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { Product } from '../../../product/product.entity';
import { Category } from '../../../category/category.entity';
import { Color } from '../../../color/color.entity';
import { productsData } from '../../../data/products';

export class ProductSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const productRepository = dataSource.getRepository(Product);
    const categoryRepository = dataSource.getRepository(Category);
    const colorRepository = dataSource.getRepository(Color);
    
    console.log('🛋️  Creando productos...');
    
    for (const productData of productsData) {
      const existingProduct = await productRepository.findOne({
        where: { name: productData.name },
      });

      if (!existingProduct) {
        // Buscar las categorías por nombre
        const categories: Category[] = [];
        for (const categoryName of productData.categoryNames) {
          const category = await categoryRepository.findOne({
            where: { name: categoryName },
          });
          if (category) {
            categories.push(category);
          }
        }

        // Buscar o crear los colores del producto
        const colors: Color[] = [];
        if (productData.colors && productData.colors.length > 0) {
          for (const colorName of productData.colors) {
            let color = await colorRepository.findOne({
              where: { name: colorName },
            });
            
            if (!color) {
              // Si el color no existe, crearlo
              color = colorRepository.create({ name: colorName });
              await colorRepository.save(color);
              console.log(`   🎨 Color creado: ${color.name}`);
            }
            colors.push(color);
          }
        }

        // Crear producto sin el campo categoryNames y colors
        const { categoryNames, colors: _, ...productInfo } = productData;
        const product = productRepository.create({
          ...productInfo,
          categories,
          colors,
        });
        
        await productRepository.save(product);
        console.log(`   ✓ Producto creado: ${product.name} (${categories.length} categorías, ${colors.length} colores)`);
      } else {
        console.log(`   - Producto ya existe: ${productData.name}`);
      }
    }
    
    console.log('✅ Productos creados exitosamente\n');
  }
}
