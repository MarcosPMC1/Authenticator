import { Test, TestingModule } from '@nestjs/testing';
import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { UserTenantDto } from './dto/user-tenant.dto';
import { CreateTenantDto } from './dto/create-tenant.dto';

describe('TenantController', () => {
  let controller: TenantController;
  let service: TenantService;

  const mockTenantService = {
    getAllTenants: jest.fn(),
    addUserToTenant: jest.fn(),
    deleteUserTenant: jest.fn(),
    createTenant: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TenantController],
      providers: [
        { provide: TenantService, useValue: mockTenantService },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<TenantController>(TenantController);
    service = module.get<TenantService>(TenantService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getTenants', () => {
    it('should return all tenants', async () => {
      const tenants = [{ id: '1', name: 'Tenant1' }];
      mockTenantService.getAllTenants.mockResolvedValue(tenants);

      const result = await controller.getTenants();
      expect(result).toEqual(tenants);
      expect(mockTenantService.getAllTenants).toHaveBeenCalled();
    });
  });

  describe('addUserToTenant', () => {
    it('should add a user to a tenant', async () => {
      const dto: UserTenantDto = { userId: 'user1', tenantId: 'tenant1' };
      const response = { success: true };
      mockTenantService.addUserToTenant.mockResolvedValue(response);

      const result = await controller.addUserToTenant(dto);
      expect(result).toEqual(response);
      expect(mockTenantService.addUserToTenant).toHaveBeenCalledWith(dto);
    });
  });

  describe('deleteUserTenant', () => {
    it('should delete a user from a tenant', async () => {
      const dto: UserTenantDto = { userId: 'user1', tenantId: 'tenant1' };
      const response = { success: true };
      mockTenantService.deleteUserTenant.mockResolvedValue(response);

      const result = await controller.deleteUserTenant(dto);
      expect(result).toEqual(response);
      expect(mockTenantService.deleteUserTenant).toHaveBeenCalledWith(dto);
    });
  });

  describe('createTenant', () => {
    it('should create a tenant', async () => {
      const dto: CreateTenantDto = { name: 'TenantX' };
      const response = { id: 'newTenantId', name: 'TenantX' };
      mockTenantService.createTenant.mockResolvedValue(response);

      const result = await controller.createTenant(dto);
      expect(result).toEqual(response);
      expect(mockTenantService.createTenant).toHaveBeenCalledWith(dto);
    });
  });
});