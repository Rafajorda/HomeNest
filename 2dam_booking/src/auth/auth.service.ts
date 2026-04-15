import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { User, UserRole } from '../users/user.entity';
import { LoginDto, RegisterDto, UpdateProfileDto } from './auth.dto';
import { RefreshToken } from './refresh-token.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private jwtService: JwtService,
  ) {}

  private async generateTokens(user: User) {
    // Access token - 15 minutos (igual para todos)
    const accessPayload = { sub: user.id, email: user.email, role: user.role };
    const access_token = await this.jwtService.signAsync(accessPayload, {
      expiresIn: '15m',
    });

    // Refresh token - duración según rol (se renovará automáticamente al usarse)
    const refreshTokenString = randomBytes(64).toString('hex');
    const expiresAt = new Date();
    
    // ADMIN: 1 día (más seguro)
    // USER: 7 días (menos crítico)
    const refreshTokenDays = user.role === UserRole.ADMIN ? 1 : 7;
    expiresAt.setDate(expiresAt.getDate() + refreshTokenDays);

    // Guardar refresh token en BD
    const refreshToken = this.refreshTokenRepository.create({
      token: refreshTokenString,
      user,
      expiresAt,
    });
    await this.refreshTokenRepository.save(refreshToken);

    // Calcular timestamps de expiración
    const now = Date.now();
    const accessTokenExpiresAt = now + (15 * 60 * 1000); // 15 minutos en milliseconds
    const refreshTokenExpiresAt = expiresAt.getTime();

    return {
      access_token,
      refresh_token: refreshTokenString,
      expires_in: 900, // 15 minutos en segundos
      token_type: 'Bearer',
      access_token_expires_at: accessTokenExpiresAt, // timestamp en ms
      refresh_token_expires_at: refreshTokenExpiresAt, // timestamp en ms
    };
  }
async register(registerDto: RegisterDto) {
    console.log('[AuthService] register called', { email: registerDto.email, username: registerDto.username });

    // Verificar si el email ya existe
    const existingUserByEmail = await this.userRepository.findOne({
        where: { email: registerDto.email },
    });

    if (existingUserByEmail) {
        console.log('[AuthService] email already registered:', registerDto.email);
        throw new ConflictException('El email ya está registrado');
    }

    // Verificar si el username ya existe
    const existingUserByUsername = await this.userRepository.findOne({
        where: { username: registerDto.username },
    });

    if (existingUserByUsername) {
        console.log('[AuthService] username already in use:', registerDto.username);
        throw new ConflictException('El nombre de usuario ya está en uso');
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    console.log('[AuthService] password hashed');

    // Crear el nuevo usuario (solo campos obligatorios en el registro)
    const newUser = new User();
    newUser.email = registerDto.email;
    newUser.username = registerDto.username;
    newUser.password = hashedPassword;
    newUser.role = UserRole.USER;
    newUser.status = 'active';
    newUser.isActive = true;

    const savedUser = await this.userRepository.save(newUser);
    console.log('[AuthService] user saved', { id: savedUser.id, email: savedUser.email, username: savedUser.username });

    // Generar tokens
    const tokens = await this.generateTokens(savedUser);
    console.log('[AuthService] tokens generated');

    // Retornar usuario sin la contraseña
    const { password, ...userWithoutPassword } = savedUser;

    console.log('[AuthService] register completed for user id=', savedUser.id);
    return {
        user: userWithoutPassword,
        ...tokens,
    };
}

  async login(loginDto: LoginDto) {
    console.log('[AuthService] login attempt for:', loginDto.email);
    
    // Buscar usuario por email
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    console.log('[AuthService] login successful for user:', user.id);

    // Generar tokens
    const tokens = await this.generateTokens(user);

    // Retornar usuario sin la contraseña
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      ...tokens,
    };
  }

  async refreshTokens(refreshToken: string) {
    console.log('[AuthService] refresh token attempt');
    
    // Buscar el refresh token en la BD
    const tokenRecord = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken },
      relations: ['user'],
    });

    if (!tokenRecord) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    // Verificar si está revocado
    if (tokenRecord.isRevoked) {
      throw new UnauthorizedException('Refresh token revocado');
    }

    // Verificar si expiró
    if (new Date() > tokenRecord.expiresAt) {
      throw new UnauthorizedException('Refresh token expirado');
    }

    // Verificar si el usuario está activo
    if (!tokenRecord.user.isActive) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    console.log('[AuthService] refresh token valid, generating new tokens');

    // Revocar el refresh token usado
    tokenRecord.isRevoked = true;
    await this.refreshTokenRepository.save(tokenRecord);

    // Generar nuevos tokens
    const tokens = await this.generateTokens(tokenRecord.user);

    return tokens;
  }

  async revokeRefreshToken(refreshToken: string) {
    const tokenRecord = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken },
    });

    if (tokenRecord) {
      tokenRecord.isRevoked = true;
      await this.refreshTokenRepository.save(tokenRecord);
    }

    return { message: 'Token revocado exitosamente' };
  }

  async revokeAllUserTokens(userId: number) {
    await this.refreshTokenRepository.update(
      { user: { id: userId }, isRevoked: false },
      { isRevoked: true }
    );

    return { message: 'Todos los tokens del usuario han sido revocados' };
  }

  async getProfile(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['cart', 'favorites', 'orders'],
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Si se actualiza el email, verificar que no exista
    if (updateProfileDto.email && updateProfileDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateProfileDto.email },
      });
      if (existingUser) {
        throw new ConflictException('El email ya está en uso');
      }
    }

    // Si se actualiza el username, verificar que no exista
    if (updateProfileDto.username && updateProfileDto.username !== user.username) {
      const existingUser = await this.userRepository.findOne({
        where: { username: updateProfileDto.username },
      });
      if (existingUser) {
        throw new ConflictException('El nombre de usuario ya está en uso');
      }
    }

    // Actualizar campos (excepto role, que no debe cambiar por el usuario)
    if (updateProfileDto.firstName !== undefined) user.firstName = updateProfileDto.firstName;
    if (updateProfileDto.lastName !== undefined) user.lastName = updateProfileDto.lastName;
    if (updateProfileDto.username !== undefined) user.username = updateProfileDto.username;
    if (updateProfileDto.email !== undefined) user.email = updateProfileDto.email;
    if (updateProfileDto.address !== undefined) user.address = updateProfileDto.address;
    if (updateProfileDto.avatar !== undefined) user.avatar = updateProfileDto.avatar;
    user.updatedAt = new Date();

    // Si se actualiza la contraseña, hashearla
    if (updateProfileDto.password) {
      user.password = await bcrypt.hash(updateProfileDto.password, 10);
    }

    await this.userRepository.save(user);

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async validateToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Usuario no válido');
      }

      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch {
      throw new UnauthorizedException('Token inválido');
    }
  }
}
