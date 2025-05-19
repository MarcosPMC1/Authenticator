import { TentantMiddleware } from './tenant.middleware';
import { TenantService } from './tenant.service';

describe('TentantMiddleware', () => {
  let middleware: TentantMiddleware;
  let tenantService: TenantService;

  const mockTenantService = {
    getTenantById: jest.fn(),
  };

  const mockReq: any = {
    headers: {},
  };
  const mockRes: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  const mockNext = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    tenantService = mockTenantService as any;
    middleware = new TentantMiddleware(tenantService);
    mockReq.headers = {};
    mockRes.status.mockClear();
    mockRes.json.mockClear();
    mockNext.mockClear();
  });

  it('should return 400 if tenantId is missing', async () => {
    mockReq.headers = {};
    await middleware.use(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Tenant ID is required' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 400 if tenantId is not a string', async () => {
    mockReq.headers = { 'x-tenant-id': 123 };
    await middleware.use(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Tenant ID must be a string' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 404 if tenant not found', async () => {
    mockReq.headers = { 'x-tenant-id': 'tenant1' };
    mockTenantService.getTenantById.mockResolvedValue(null);
    await middleware.use(mockReq, mockRes, mockNext);
    expect(mockTenantService.getTenantById).toHaveBeenCalledWith('tenant1');
    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Tenant not found' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should set tenant on req and call next if tenant exists', async () => {
    mockReq.headers = { 'x-tenant-id': 'tenant1' };
    const tenant = { id: 'tenant1', name: 'Tenant1' };
    mockTenantService.getTenantById.mockResolvedValue(tenant);
    await middleware.use(mockReq, mockRes, mockNext);
    expect(mockTenantService.getTenantById).toHaveBeenCalledWith('tenant1');
    expect(mockReq['tenant']).toBe(tenant);
    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalledWith(400);
    expect(mockRes.status).not.toHaveBeenCalledWith(404);
  });
});