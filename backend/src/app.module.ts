import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { getAuthLoginRateLimit, getAuthLoginRateTtlMs } from './common/constants';
import { getDatabaseConfig } from './config/database.config';
import { PermissionsModule } from './permissions/permissions.module';
import { RolesModule } from './roles/roles.module';
import { SeedModule } from './seed/seed.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => getDatabaseConfig(),
    }),
    ThrottlerModule.forRoot([
      {
        ttl: getAuthLoginRateTtlMs(),
        limit: getAuthLoginRateLimit(),
      },
    ]),
    PermissionsModule,
    RolesModule,
    UsersModule,
    AuthModule,
    SeedModule,
  ],
})
export class AppModule {}
