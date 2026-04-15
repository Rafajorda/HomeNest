import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '../users/user.entity';
import { RefreshToken } from './refresh-token.entity';
import { CartModule } from '../cart/cart.module';
import { FavoritesModule } from '../favorites/favorites.module';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, RefreshToken]),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'tu_secreto_super_seguro_cambialo',
      signOptions: { expiresIn: '15m' }, // Access token 15 minutos
    }),
    CartModule,
    FavoritesModule,
    OrderModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
