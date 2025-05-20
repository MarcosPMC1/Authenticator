import { TenantProvider } from './tenant.provider';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

describe('TenantProvider', () => {
  let provider: TenantProvider;
  let configService: ConfigService;

  const mockConfigService = {
    getOrThrow: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    configService = mockConfigService as any;
    provider = new TenantProvider(configService);
  });

  it('should return an existing connection from the map', () => {
    const dbName = 'testdb';
    const mockConnection = {} as DataSource;
    // @ts-ignore
    provider['connections'].set(dbName, mockConnection);

    const result = provider.getConnection(dbName);
    expect(result).toBe(mockConnection);
  });

  it('should create a new connection if not in the map', () => {
    const dbName = 'newdb';
    mockConfigService.getOrThrow.mockImplementation((key: string) => {
      const values = {
        POSTGRES_USER: 'user',
        POSTGRES_DATABASE: dbName,
        POSTGRES_PASSWORD: 'pass',
        POSTGRES_HOST: 'localhost',
        POSTGRES_PORT: 5432,
      };
      return values[key];
    });

    const result = provider.getConnection(dbName);
    expect(result).toBeInstanceOf(DataSource);
    expect(result?.options.database).toBe(dbName);
    expect(provider['connections'].get(dbName)).toBe(result);
  });

  it('should use correct config keys for DataSource', () => {
    const dbName = 'anotherdb';
    const configSpy = jest.spyOn(mockConfigService, 'getOrThrow');
    provider.getConnection(dbName);
    expect(configSpy).toHaveBeenCalledWith('POSTGRES_USER');
    expect(configSpy).toHaveBeenCalledWith('POSTGRES_DATABASE');
    expect(configSpy).toHaveBeenCalledWith('POSTGRES_PASSWORD');
    expect(configSpy).toHaveBeenCalledWith('POSTGRES_HOST');
    expect(configSpy).toHaveBeenCalledWith('POSTGRES_PORT');
  });
});