import { Test, TestingModule } from '@nestjs/testing';
import { TenantService } from './tenant.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Tenant } from './entity/tenant.entity';
import { TenantUsers } from './entity/tenant-users.entity';
import { Repository, DataSource } from 'typeorm';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UserTenantDto } from './dto/user-tenant.dto';

describe('TenantService', () => {
  let service: TenantService;
  let tenantRepository: Repository<Tenant>;
  let tenantUsersRepository: Repository<TenantUsers>;
  let dataSource: DataSource;

  const mockTenantRepository = {
    save: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
    softDelete: jest.fn(),
    find: jest.fn(),
  };

  const mockTenantUsersRepository = {
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockDataSource = {
    query: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantService,
        { provide: getRepositoryToken(Tenant), useValue: mockTenantRepository },
        { provide: getRepositoryToken(TenantUsers), useValue: mockTenantUsersRepository },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<TenantService>(TenantService);
    tenantRepository = module.get(getRepositoryToken(Tenant));
    tenantUsersRepository = module.get(getRepositoryToken(TenantUsers));
    dataSource = module.get(DataSource);

    jest.clearAllMocks();
  });

  describe('createTenant', () => {
    it('should create a tenant and database', async () => {
      const dto: CreateTenantDto = { name: 'TenantX' };
      const createdTenant = { id: '1', name: 'TenantX' };
      const tenantEntity = { ...dto, id: '1', createdAt: new Date(), updatedAt: new Date(), deletedAt: null, users: [] } as Tenant;
      jest.spyOn(tenantRepository, 'create').mockReturnValue(tenantEntity);
      jest.spyOn(tenantRepository, 'save').mockResolvedValue(tenantEntity);
      jest.spyOn(dataSource, 'query').mockResolvedValue(undefined);

      const result = await service.createTenant(dto);
      expect(tenantRepository.create).toHaveBeenCalledWith(dto);
      expect(tenantRepository.save).toHaveBeenCalledWith(tenantEntity);
      expect(dataSource.query).toHaveBeenCalledWith(`CREATE DATABASE "${tenantEntity.id}"`);
      expect(result).toEqual(tenantEntity);
    });
  });

  describe('getTenantById', () => {
    it('should return a tenant by id', async () => {
      const tenant = { id: '1', name: 'Tenant1' };
      jest.spyOn(tenantRepository, 'findOne').mockResolvedValue(tenant as any);

      const result = await service.getTenantById('1');
      expect(result).toEqual(tenant);
      expect(tenantRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
    });
  });

  describe('deleteTenant', () => {
    it('should soft delete a tenant', async () => {
      jest.spyOn(tenantRepository, 'softDelete').mockResolvedValue(undefined);

      await service.deleteTenant('1');
      expect(tenantRepository.softDelete).toHaveBeenCalledWith('1');
    });
  });

  describe('getAllTenants', () => {
    it('should return all tenants', async () => {
      const tenants = [{ id: '1', name: 'Tenant1' }];
      jest.spyOn(tenantRepository, 'find').mockResolvedValue(tenants as any);

      const result = await service.getAllTenants();
      expect(result).toEqual(tenants);
      expect(tenantRepository.find).toHaveBeenCalled();
    });
  });

  describe('addUserToTenant', () => {
    it('should add a user to a tenant', async () => {
      const dto: UserTenantDto = { userId: 'user1', tenantId: 'tenant1' };
      const tenant = { id: 'tenant1', name: 'Tenant1' };
      const tenantUser = { tenantId: 'tenant1', userId: 'user1' };

      jest.spyOn(service, 'getTenantById').mockResolvedValue(tenant as Tenant);
      jest.spyOn(tenantUsersRepository, 'save').mockResolvedValue(tenantUser as any);

      const result = await service.addUserToTenant(dto);
      expect(service.getTenantById).toHaveBeenCalledWith('tenant1');
      expect(tenantUsersRepository.save).toHaveBeenCalledWith({
        tenantId: 'tenant1',
        userId: 'user1',
      });
      expect(result).toEqual(tenantUser);
    });

    it('should throw error if tenant not found', async () => {
      const dto: UserTenantDto = { userId: 'user1', tenantId: 'tenant1' };
      jest.spyOn(service, 'getTenantById').mockResolvedValue(null);

      await expect(service.addUserToTenant(dto)).rejects.toThrow('Tenant not found');
    });
  });

  describe('deleteUserTenant', () => {
    it('should delete a user from a tenant', async () => {
      const dto: UserTenantDto = { userId: 'user1', tenantId: 'tenant1' };
      jest.spyOn(tenantUsersRepository, 'delete').mockResolvedValue(undefined);

      await service.deleteUserTenant(dto);
      expect(tenantUsersRepository.delete).toHaveBeenCalledWith({
        tenantId: 'tenant1',
        userId: 'user1',
      });
    });
  });
});