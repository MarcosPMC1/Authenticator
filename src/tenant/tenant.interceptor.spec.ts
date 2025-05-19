import { TenantInterceptor } from './tenant.interceptor';
import { TenantService } from './tenant.service';
import { CallHandler, ExecutionContext, BadRequestException, NotFoundException } from '@nestjs/common';

describe('TenantInterceptor', () => {
  let interceptor: TenantInterceptor;
  let tenantService: TenantService;

  const mockTenantService = {
    getTenantById: jest.fn(),
  };

  const mockCallHandler = {
    handle: jest.fn(() => 'nextHandle'),
  };

  const mockRequest = {
    headers: {},
  };

  const mockContext = {
    switchToHttp: () => ({
      getRequest: () => mockRequest,
    }),
  } as unknown as ExecutionContext;

  beforeEach(() => {
    jest.clearAllMocks();
    tenantService = mockTenantService as any;
    interceptor = new TenantInterceptor(tenantService);
  });

  it('should throw BadRequestException if tenantId is missing', async () => {
    mockRequest.headers = {};
    await expect(interceptor.intercept(mockContext, mockCallHandler as any)).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException if tenantId is not a string', async () => {
    mockRequest.headers = { 'x-tenant-id': 123 };
    await expect(interceptor.intercept(mockContext, mockCallHandler as any)).rejects.toThrow(BadRequestException);
  });

  it('should throw NotFoundException if tenant does not exist', async () => {
    mockRequest.headers = { 'x-tenant-id': 'tenant1' };
    mockTenantService.getTenantById.mockResolvedValue(null);

    await expect(interceptor.intercept(mockContext, mockCallHandler as any)).rejects.toThrow(NotFoundException);
    expect(mockTenantService.getTenantById).toHaveBeenCalledWith('tenant1');
  });

  it('should set tenant on request and call next.handle()', async () => {
    mockRequest.headers = { 'x-tenant-id': 'tenant1' };
    mockTenantService.getTenantById.mockResolvedValue({ id: 'tenant1', name: 'Tenant1' });

    const result = await interceptor.intercept(mockContext, mockCallHandler as any);
    expect(mockTenantService.getTenantById).toHaveBeenCalledWith('tenant1');
    expect(mockRequest['tenant']).toBe('tenant1');
    expect(result).toBe('nextHandle');
  });
});