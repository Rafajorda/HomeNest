// data/users.ts

import { UserRole } from '../users/user.entity';

export const userData = [
  {
    firstName: 'Juan',
    lastName: 'Pérez',
    username: 'juanp',
    email: 'juan@example.com',
    password: 'password123',
    role: UserRole.USER,
    address: 'Calle Falsa 123',
    avatar: 'https://i.pravatar.cc/150?img=1',
  },
  {
    firstName: 'Lucía',
    lastName: 'Martínez',
    username: 'luciam',
    email: 'lucia@example.com',
    password: 'lucia123',
    role: UserRole.USER,
    address: 'Avenida Siempreviva 742',
    avatar: 'https://i.pravatar.cc/150?img=5',
  },
  {
    firstName: 'Admin',
    lastName: 'Root',
    username: 'admin',
    email: 'admin@example.com',
    password: 'admin123',
    role: UserRole.ADMIN,
    address: 'Admin Street 1',
    avatar: 'https://i.pravatar.cc/150?img=10',
  },
];
