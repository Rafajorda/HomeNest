export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export interface User {
  id: number;
  firstName?: string;
  lastName?: string;
  username: string;
  email: string;
  role: UserRole;
  status: string;
  isActive: boolean;
  address?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  username: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  address?: string;
  avatar?: string;
}

export interface UpdateUserDto {
  email?: string;
  password?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  address?: string;
  avatar?: string;
}
