import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { Favorites } from '../../../favorites/favorites.entity';
import { User } from '../../../users/user.entity';
import { Product } from '../../../product/product.entity';

export class FavoritesSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const favoritesRepository = dataSource.getRepository(Favorites);
    const userRepository = dataSource.getRepository(User);
    const productRepository = dataSource.getRepository(Product);
    
    console.log('🌱 Seeding favorites...');
    
    // Obtener usuarios normales (no admin)
    const users = await userRepository.find();
    const normalUsers = users.filter(u => u.email !== 'admin@example.com');
    
    // Obtener algunos productos
    const products = await productRepository.find({ take: 8 });
    
    if (normalUsers.length > 0 && products.length > 0) {
      // Cada usuario tiene 2-3 favoritos aleatorios
      for (const user of normalUsers) {
        const numberOfFavorites = Math.floor(Math.random() * 2) + 2; // 2 o 3 favoritos
        const shuffledProducts = products.sort(() => Math.random() - 0.5);
        
        for (let i = 0; i < numberOfFavorites && i < shuffledProducts.length; i++) {
          const product = shuffledProducts[i];
          
          const existingFavorite = await favoritesRepository.findOne({
            where: { 
              user: { id: user.id },
              product: { id: product.id }
            },
          });

          if (!existingFavorite) {
            const favorite = favoritesRepository.create({
              user,
              product,
            });
            
            await favoritesRepository.save(favorite);
            console.log(`✅ Favorite created: ${user.username} ❤️ ${product.name}`);
          }
        }
      }
    }
    
    console.log('✅ Favorites seeding completed!');
  }
}
