import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { DatabaseModule } from '../database/database.module';
import { DatabaseService } from '../database/database.service';
@Module({
  imports: [
    UsersModule,
    PassportModule,
    DatabaseModule,
    JwtModule.register({
      secret: 'chaincodeconsulting', // ⚠️ Move to .env in production
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy,DatabaseService],
  controllers: [AuthController],
  exports: [AuthService, JwtModule], // ✅ Exporting JwtModule
})
export class AuthModule {}
