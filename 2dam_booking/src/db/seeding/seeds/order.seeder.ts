import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { Order } from '../../../order/order.entity';
import { OrderLine } from '../../../orderline/orderline.entity';
import { User } from '../../../users/user.entity';
import { Product } from '../../../product/product.entity';

export class OrderSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const orderRepository = dataSource.getRepository(Order);
    const orderLineRepository = dataSource.getRepository(OrderLine);
    const userRepository = dataSource.getRepository(User);
    const productRepository = dataSource.getRepository(Product);
    
    console.log('🌱 Seeding orders...');
    
    // Obtener usuarios normales (no admin)
    const users = await userRepository.find();
    const normalUsers = users.filter(u => u.email !== 'admin@example.com');
    
    // Obtener productos
    const products = await productRepository.find();
    
    if (normalUsers.length > 0 && products.length > 0) {
      const orderStatuses = ['pending', 'processing', 'completed', 'cancelled'];
      
      // Crear 2-3 órdenes por usuario
      for (const user of normalUsers) {
        const numberOfOrders = Math.floor(Math.random() * 2) + 2; // 2 o 3 órdenes
        
        for (let i = 0; i < numberOfOrders; i++) {
          // Seleccionar productos aleatorios para esta orden
          const numberOfProducts = Math.floor(Math.random() * 3) + 1; // 1-3 productos por orden
          const shuffledProducts = [...products].sort(() => Math.random() - 0.5);
          const orderProducts = shuffledProducts.slice(0, numberOfProducts);
          
          // Calcular total
          let total = 0;
          const orderLinesData: Array<{ product: Product; quantity: number; price: number }> = [];
          
          for (const product of orderProducts) {
            const quantity = Math.floor(Math.random() * 2) + 1; // 1-2 unidades
            const price = Number(product.price);
            total += price * quantity;
            
            orderLinesData.push({
              product,
              quantity,
              price,
            });
          }
          
          // Crear la orden
          const order = orderRepository.create({
            user,
            total,
            status: orderStatuses[Math.floor(Math.random() * orderStatuses.length)],
            slug: `order-${user.username}-${Date.now()}-${i}`,
          });
          
          const savedOrder = await orderRepository.save(order);
          console.log(`✅ Order created: ${savedOrder.slug} - Total: €${total.toFixed(2)}`);
          
          // Crear las líneas de orden
          for (const lineData of orderLinesData) {
            const orderLine = orderLineRepository.create({
              order: savedOrder,
              product: lineData.product,
              quantity: lineData.quantity,
              price: lineData.price,
              status: 'active',
            });
            
            await orderLineRepository.save(orderLine);
            console.log(`  📦 OrderLine: ${lineData.quantity}x ${lineData.product.name}`);
          }
        }
      }
    }
    
    console.log('✅ Orders seeding completed!');
  }
}
