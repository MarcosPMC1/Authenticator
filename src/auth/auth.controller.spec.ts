import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Users } from './entities/users.entity';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockUser: Users = {
    id: '123',
    email: 'teste@teste.com',
    password: 'hashed',
    createdAt: new Date(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            registrate: jest.fn()
          }
        }
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService)
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('authService should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('login', () => {
    it('succes', () => {
      jest.spyOn(authService, 'login').mockResolvedValueOnce({ access_token: 'token' })
      const result = controller.loginAuth({ email: 'teste@teste.com', password: 'hashed' })
      expect(result).resolves.toEqual({ access_token: 'token' })
    })
  })

  describe('registrate', () => {
    it('succes', () => {
      jest.spyOn(authService, 'registrate').mockResolvedValueOnce({ id: mockUser.id, email: mockUser.email })
      const result = controller.registrateAuth({ email: mockUser.email, password: mockUser.password })
      expect(result).resolves.toEqual({ id: mockUser.id, email: mockUser.email })
    })
  })
});
