import { IsString, IsNotEmpty, IsEmail, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'juan@example.com',
    description: 'Email del usuario',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'MiContraseña123',
    description: 'Contraseña del usuario',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RegisterDto {
  @ApiProperty({
    example: 'juan@example.com',
    description: 'Correo electrónico',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'MiContraseña123',
    description: 'Contraseña (mínimo 6 caracteres)',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @ApiProperty({
    example: 'juanperez',
    description: 'Nombre de usuario único',
  })
  @IsString()
  @IsNotEmpty()
  username: string;
}

export class RefreshTokenDto {
  @ApiProperty({
    example: 'a1b2c3d4e5f6...',
    description: 'Refresh token',
  })
  @IsString()
  @IsNotEmpty()
  refresh_token: string;
}

export class UpdateProfileDto {
  @ApiPropertyOptional({
    example: 'juan@example.com',
    description: 'Correo electrónico',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    example: 'MiContraseña123',
    description: 'Nueva contraseña (mínimo 6 caracteres)',
  })
  @IsString()
  @IsOptional()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password?: string;

  @ApiPropertyOptional({
    example: 'juanperez',
    description: 'Nombre de usuario único',
  })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiPropertyOptional({
    example: 'Juan',
    description: 'Nombre del usuario',
  })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({
    example: 'Pérez',
    description: 'Apellido del usuario',
  })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({
    example: 'Calle Falsa 123',
    description: 'Dirección del usuario',
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({
    example: 'https://ejemplo.com/avatar.jpg',
    description: 'URL del avatar del usuario o ruta de la imagen',
  })
  @IsString()
  @IsOptional()
  avatar?: string;
}

export class TokenResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Access token JWT',
  })
  access_token: string;

  @ApiProperty({
    example: 'a1b2c3d4e5f6g7h8i9j0...',
    description: 'Refresh token',
  })
  refresh_token: string;

  @ApiProperty({
    example: 900,
    description: 'Tiempo de expiración del access token en segundos (15 minutos)',
  })
  expires_in: number;

  @ApiProperty({
    example: 'Bearer',
    description: 'Tipo de token',
  })
  token_type: string;

  @ApiProperty({
    example: 1700000000000,
    description: 'Timestamp (en milisegundos) de expiración del access token',
  })
  access_token_expires_at: number;

  @ApiProperty({
    example: 1700604800000,
    description: 'Timestamp (en milisegundos) de expiración del refresh token',
  })
  refresh_token_expires_at: number;
}

export class LoginResponseDto extends TokenResponseDto {
  @ApiProperty({
    description: 'Datos del usuario autenticado',
  })
  user: {
    id: string;
    email: string;
    username: string;
    role: string;
    isActive: boolean;
  };
}
