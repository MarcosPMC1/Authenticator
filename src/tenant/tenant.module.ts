import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from './entity/tenant.entity';
import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';
import { TenantProvider } from './tenant.provider';
import { TenantUsers } from './entity/tenant-users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant, TenantUsers])],
  controllers: [TenantController],
  providers: [TenantService, TenantProvider],
})

export class TenantModule {}
