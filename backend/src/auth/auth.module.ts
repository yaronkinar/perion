import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import type { SignOptions } from 'jsonwebtoken';
import {
  DEFAULT_JWT_TTL,
  MIN_SECRET_LENGTH,
  isProduction,
} from '../common/constants';
import { ERRORS } from '../common/messages';
import { User } from '../users/entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

function readJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(ERRORS.jwtSecretRequired);
  }
  if (isProduction() && secret.length < MIN_SECRET_LENGTH) {
    throw new Error(ERRORS.jwtSecretRequired);
  }
  return secret;
}

function readJwtOptions(): JwtModuleOptions {
  const ttl = (process.env.JWT_TTL ?? DEFAULT_JWT_TTL) as SignOptions['expiresIn'];
  return {
    secret: readJwtSecret(),
    signOptions: { expiresIn: ttl },
  };
}

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      useFactory: (): JwtModuleOptions => readJwtOptions(),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
