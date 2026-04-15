import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { ImagesProduct } from '../../../images/images.entity';
import { Product } from '../../../product/product.entity';
import { imagesData } from '../../../data/images';

export class ImagesSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const imagesRepository = dataSource.getRepository(ImagesProduct);
    const productRepository = dataSource.getRepository(Product);
    
    console.log('🌱 Seeding images...');
    
    for (const imageData of imagesData) {
      const existingImage = await imagesRepository.findOne({
        where: { src: imageData.src },
      });

      if (!existingImage) {
        // Buscar el producto por nombre
        const product = await productRepository.findOne({
          where: { name: imageData.productName },
        });

        if (product) {
          const { productName, ...imageInfo } = imageData;
          const image = imagesRepository.create({
            ...imageInfo,
            product,
          });
          
          await imagesRepository.save(image);
          console.log(`✅ Image created for: ${imageData.productName}`);
        } else {
          console.log(`⚠️  Product not found for image: ${imageData.productName}`);
        }
      } else {
        console.log(`⏭️  Image already exists: ${imageData.alt}`);
      }
    }
    
    console.log('✅ Images seeding completed!');
  }
}
