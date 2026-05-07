import { Module, type MiddlewareConsumer, type NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { getDatabaseConfig } from './config/database.config';
import { PermissionsModule } from './permissions/permissions.module';
import { PermissionsMiddleware } from './permissions/permissions.middleware';
import { RolesModule } from './roles/roles.module';
import { SeedModule } from './seed/seed.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
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
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(PermissionsMiddleware).forRoutes('users', 'roles');
  }
}
