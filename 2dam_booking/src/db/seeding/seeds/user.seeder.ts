// src/database/seeders/user/user.seeder.ts

import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { userData } from '../../../data/users';
import { User } from '../../../users/user.entity';
import * as bcrypt from 'bcrypt';

export class UserSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const userRepository = dataSource.getRepository(User);

    console.log('🌱 Seeding users...');

    for (const item of userData) {
      const existingUser = await userRepository.findOne({
        where: { email: item.email },
      });

      if (!existingUser) {
        const user = userRepository.create({
          firstName: item.firstName,
          lastName: item.lastName,
          username: item.username,
          email: item.email,
          role: item.role,
          address: item.address,
          password: await bcrypt.hash(item.password, 10),
        });

        await userRepository.save(user);
        console.log(`✅ User created: ${user.username} (${user.email})`);
      } else {
        console.log(`⏭️  User already exists: ${item.email}`);
      }
    }

    console.log('✅ Users seeding completed!');
  }
}
