import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { Cart } from '../../../cart/cart.entity';
import { User } from '../../../users/user.entity';

export class CartSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const cartRepository = dataSource.getRepository(Cart);
    const userRepository = dataSource.getRepository(User);
    
    console.log('🌱 Seeding carts...');
    
    // Obtener todos los usuarios
    const users = await userRepository.find();
    
    for (const user of users) {
      const existingCart = await cartRepository.findOne({
        where: { user: { id: user.id } },
      });

      if (!existingCart) {
        const cart = cartRepository.create({
          user,
          total: 0,
          status: 'active',
        });
        
        await cartRepository.save(cart);
        console.log(`✅ Cart created for user: ${user.username}`);
      } else {
        console.log(`⏭️  Cart already exists for user: ${user.username}`);
      }
    }
    
    console.log('✅ Carts seeding completed!');
  }
}
