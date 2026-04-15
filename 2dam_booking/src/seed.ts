import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { runSeeders, SeederOptions } from 'typeorm-extension';
import { User } from './users/user.entity';
import { Cart } from './cart/cart.entity';
import { CartProduct } from './cart/cartProduct.entity';
import { Category } from './category/category.entity';
import { Color } from './color/color.entity';
import { ImagesProduct } from './images/images.entity';
import { Order } from './order/order.entity';
import { OrderLine } from './orderline/orderline.entity';
import { Product } from './product/product.entity';
import { Favorites } from './favorites/favorites.entity';
import { RefreshToken } from './auth/refresh-token.entity';

import { UserSeeder } from './db/seeding/seeds/user.seeder';
import { CategorySeeder } from './db/seeding/seeds/category.seeder';
import { ColorSeeder } from './db/seeding/seeds/color.seeder';
import { ProductSeeder } from './db/seeding/seeds/product.seeder';
import { ImagesSeeder } from './db/seeding/seeds/images.seeder';
import { CartSeeder } from './db/seeding/seeds/cart.seeder';
import { FavoritesSeeder } from './db/seeding/seeds/favorites.seeder';
import { OrderSeeder } from './db/seeding/seeds/order.seeder';

import { config } from 'dotenv';

config();

const options: DataSourceOptions & SeederOptions = {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB,

  entities: [
    User,
    Cart,
    CartProduct,
    Product,
    Category,
    Color,
    Order,
    OrderLine,
    ImagesProduct,
    Favorites,
    RefreshToken,
  ],
  seeds: [
    UserSeeder,      
    CategorySeeder,
    ColorSeeder,
    ProductSeeder,   
    ImagesSeeder,    
    CartSeeder,      
    FavoritesSeeder, 
    OrderSeeder,    
  ],
};

const dataSource = new DataSource(options);

dataSource
  .initialize()
  .then(async () => {
    await dataSource.synchronize(true);
    await runSeeders(dataSource);
    process.exit();
  })
  .catch((error) => console.log('Error initializing data source', error));
