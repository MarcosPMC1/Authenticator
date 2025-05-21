import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { Repository } from 'typeorm';
import { Users } from '../users/entities/users.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Role } from '../enums/role.enum';

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
    deletedAt: null,
    role: Role.User,
    updateAt: new Date(),
    tenants: [],
    username: 'testuser',
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
    it('success', async () => {
      jest.spyOn(usersRepository, 'create').mockReturnValueOnce(mockUser);
      jest.spyOn(usersRepository, 'save').mockResolvedValueOnce(mockUser);
      const result = await service.registrate({
        email: 'teste@teste.com',
        password: 'hashed',
        username: 'testuser',
      });
      expect(result).toEqual({
        id: '123',
        email: 'teste@teste.com',
        username: 'testuser',
      });
    });

    it('User already exists', async () => {
      jest.spyOn(usersRepository, 'create').mockReturnValueOnce(mockUser);
      jest
        .spyOn(usersRepository, 'save')
        .mockRejectedValueOnce({ code: '23505' });
      await expect(
        service.registrate({
          email: 'teste@teste.com',
          password: 'hashed',
          username: 'testuser',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('Database error', async () => {
      jest.spyOn(usersRepository, 'create').mockReturnValueOnce(mockUser);
      jest.spyOn(usersRepository, 'save').mockRejectedValue(new Error());
      await expect(
        service.registrate({
          email: 'teste@teste.com',
          password: 'hashed',
          username: 'testuser',
        }),
      ).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });

  describe('login', () => {
    it('success', async () => {
      const hashedPassword = bcrypt.hashSync(mockUser.password, 11);
      jest.spyOn(usersRepository, 'findOne').mockResolvedValueOnce({
        ...mockUser,
        password: hashedPassword,
      });
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);
      jest.spyOn(service, 'generateTokens').mockResolvedValueOnce({
        access_token: 'access_token',
        refresh_token: 'refresh_token',
      });

      const result = await service.login({
        email: 'teste@teste.com',
        password: 'hashed',
      });
      expect(result).toEqual({
        access_token: 'access_token',
        refresh_token: 'refresh_token',
      });
    });

    it('NotFound User', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValueOnce(undefined);
      await expect(
        service.login({
          email: 'testeee@teste.com',
          password: 'hashed',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('Wrong password', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValueOnce({
        ...mockUser,
        password: bcrypt.hashSync(mockUser.password, 11),
      });
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(false);
      await expect(
        service.login({
          email: 'testeee@teste.com',
          password: 'hasheeedede',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });
});
