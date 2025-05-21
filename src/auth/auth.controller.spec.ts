import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Users } from '../users/entities/users.entity';
import { Role } from '../enums/role.enum';
import { JwtService } from '@nestjs/jwt';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockUser: Users = {
    id: '123',
    email: 'teste@teste.com',
    password: 'hashed',
    createdAt: new Date(),
    deletedAt: null,
    role: Role.User,
    updateAt: new Date(),
    tenants: [],
    username: 'testuser',
  };

  const authServiceMock = {
    login: jest.fn(),
    registrate: jest.fn(),
    generateTokens: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('token'),
            verify: jest.fn().mockReturnValue({ id: '123' }),
          }
        }
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('authService should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('login', () => {
    it('success', async () => {
      authServiceMock.login.mockResolvedValueOnce({ access_token: 'token' });
      const result = await controller.loginAuth({
        email: 'teste@teste.com',
        password: 'hashed',
      });
      expect(result).toEqual({ access_token: 'token' });
      expect(authServiceMock.login).toHaveBeenCalledWith({
        email: 'teste@teste.com',
        password: 'hashed',
      });
    });
  });

  describe('registrate', () => {
    it('success', async () => {
      authServiceMock.registrate.mockResolvedValueOnce({
        id: mockUser.id,
        email: mockUser.email,
        username: mockUser.username,
      });
      const result = await controller.registrateAuth({
        email: mockUser.email,
        password: mockUser.password,
        username: mockUser.username,
      });
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        username: mockUser.username,
      });
      expect(authServiceMock.registrate).toHaveBeenCalledWith({
        email: mockUser.email,
        password: mockUser.password,
        username: mockUser.username,
      });
    });
  });

  describe('refreshToken', () => {
    it('success', async () => {
      authServiceMock.generateTokens.mockResolvedValueOnce({
        access_token: 'access',
        refresh_token: 'refresh',
      });
      const req = { user: mockUser };
      const result = await controller.refreshToken(req);
      expect(result).toEqual({
        access_token: 'access',
        refresh_token: 'refresh',
      });
      expect(authServiceMock.generateTokens).toHaveBeenCalledWith(mockUser);
    });
  });
});