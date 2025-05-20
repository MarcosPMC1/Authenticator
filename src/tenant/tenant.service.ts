import { InjectRepository } from "@nestjs/typeorm";
import { Tenant } from "./entity/tenant.entity";
import { DataSource, Repository } from "typeorm";
import { CreateTenantDto } from "./dto/create-tenant.dto";
import { TenantUsers } from "./entity/tenant-users.entity";
import { UserTenantDto } from "./dto/user-tenant.dto";
import { Injectable, NotFoundException } from "@nestjs/common";

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    @InjectRepository(TenantUsers)
    private readonly tenantUsersRepository: Repository<TenantUsers>,
    private dataSource: DataSource,
  ) {}

  async createTenant(tenantData: CreateTenantDto): Promise<Tenant> {
    const tenant = await this.tenantRepository.save(this.tenantRepository.create(tenantData));
    await this.dataSource.query(`CREATE DATABASE "${tenant.id}"`);
    return tenant;
  }

  async getTenantById(id: string): Promise<Tenant> {
    return this.tenantRepository.findOne({ where: { id } });
  }

  async deleteTenant(id: string): Promise<void> {
    await this.tenantRepository.softDelete(id);
  }

  async getAllTenants(): Promise<Tenant[]> {
    return this.tenantRepository.find();
  }

  async getTenantbyUser(userId: string): Promise<TenantUsers[]> {
    return this.tenantUsersRepository.find({ where: { userId } });
  }

  async addUserToTenant(data: UserTenantDto): Promise<TenantUsers> {
    const tenant = await this.getTenantById(data.tenantId);
    if (!tenant) {
      throw new NotFoundException("Tenant not found");
    }
    
    return this.tenantUsersRepository.save({
      tenantId: data.tenantId,
      userId: data.userId,
    })
  }

  async deleteUserTenant(data: UserTenantDto): Promise<void> {
    await this.tenantUsersRepository.delete({
      tenantId: data.tenantId,
      userId: data.userId,
    });
  }
}