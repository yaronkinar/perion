import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Permission } from '../permissions/entities/permission.entity';
import { Role } from '../roles/entities/role.entity';
import { User } from '../users/entities/user.entity';
import { ERRORS } from '../common/messages';
import { isProduction } from '../common/constants';

export function getDatabaseConfig(): TypeOrmModuleOptions {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(ERRORS.databaseUrlRequired);
  }

  const prod = isProduction();

  return {
    type: 'postgres',
    url,
    entities: [Permission, Role, User],
    synchronize: !prod,
    autoLoadEntities: true,
    logging: prod ? ['error'] : ['error', 'warn'],
  };
}
