import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { getDatabaseConfig } from './config/database.config';
import { PermissionsModule } from './permissions/permissions.module';
import { RolesModule } from './roles/roles.module';
import { SeedModule } from './seed/seed.module';
import { UsersModule } from './users/users.module';
import {
  authLoginThrottleLimit,
  authLoginThrottleTtlSeconds,
} from './common/constants';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        limit: authLoginThrottleLimit(),
        ttl: authLoginThrottleTtlSeconds() * 1000,
      },
    ]),
    TypeOrmModule.forRootAsync({
      useFactory: () => getDatabaseConfig(),
    }),
    PermissionsModule,
    RolesModule,
    UsersModule,
    AuthModule,
    SeedModule,
  ],
})
export class AppModule {}
