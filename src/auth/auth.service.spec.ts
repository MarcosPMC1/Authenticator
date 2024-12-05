import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { Repository } from 'typeorm';
import { Users } from './entities/users.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let usersRepository: Repository<Users>;
  let jwtService: JwtService;

  const USER_REPOSITORY_TOKEN = getRepositoryToken(Users);

  const mockUser: Users = {
    id: '123',
    email: 'teste@teste.com',
    password: 'hashed',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: USER_REPOSITORY_TOKEN,
          useValue: {
            save: jest.fn(),
            create: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersRepository = module.get<Repository<Users>>(USER_REPOSITORY_TOKEN);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('usersRepository should be defined', () => {
    expect(usersRepository).toBeDefined();
  });

  it('jwtService should be defined', () => {
    expect(jwtService).toBeDefined();
  });

  describe('registrate', () => {
    it('success', () => {
      jest.spyOn(usersRepository, 'create').mockReturnValueOnce(mockUser);
      jest.spyOn(usersRepository, 'save').mockResolvedValueOnce(mockUser);
      const result = service.registrate({
        email: 'teste@teste.com',
        password: 'hashed',
      });
      expect(result).resolves.toEqual({ id: '123', email: 'teste@teste.com' });
    });

    it('User already exists', () => {
      jest.spyOn(usersRepository, 'create').mockReturnValueOnce(mockUser);
      jest
        .spyOn(usersRepository, 'save')
        .mockRejectedValueOnce({ code: '23505' });
      const result = service.registrate({
        email: 'teste@teste.com',
        password: 'hashed',
      });
      expect(result).rejects.toBeInstanceOf(BadRequestException);
      expect(result).rejects.toHaveProperty('message', 'User already exists');
    });

    it('Database error', () => {
      jest.spyOn(usersRepository, 'create').mockReturnValueOnce(mockUser);
      jest.spyOn(usersRepository, 'save').mockRejectedValue(new Error());
      const result = service.registrate({
        email: 'teste@teste.com',
        password: 'hashed',
      });
      expect(result).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });

  describe('login', () => {
    it('success', () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValueOnce({
        ...mockUser,
        password: bcrypt.hashSync(mockUser.password, 11),
      });
      jest.spyOn(jwtService, 'sign').mockReturnValueOnce('token');
      const result = service.login({
        email: 'teste@teste.com',
        password: 'hashed',
      });
      expect(result).resolves.toEqual({
        access_token: 'token',
      });
    });

    it('NotFound User', () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValueOnce(undefined);
      const result = service.login({
        email: 'testeee@teste.com',
        password: 'hashed',
      });
      expect(result).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('Wrong password', () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValueOnce({
        ...mockUser,
        password: bcrypt.hashSync(mockUser.password, 11),
      });
      const result = service.login({
        email: 'testeee@teste.com',
        password: 'hasheeedede',
      });
      expect(result).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });
});
