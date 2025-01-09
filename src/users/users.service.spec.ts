import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Users } from './entities/users.entity';
import { Role } from '../enums/role.enum';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: Repository<Users>;

  const mockUser: Users = {
    id: '123',
    email: 'teste@teste.com',
    password: 'hashed',
    createdAt: new Date(),
    deletedAt: null,
    role: Role.User,
    updateAt: new Date()
  };

  const USER_REPOSITORY_TOKEN = getRepositoryToken(Users);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: USER_REPOSITORY_TOKEN,
          useValue: {
            save: jest.fn(),
            softDelete: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            update: jest.fn()
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get<Repository<Users>>(USER_REPOSITORY_TOKEN)
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('usersRepository should be defined', () => {
    expect(usersRepository).toBeDefined();
  });

  describe('list', () => { 
    it('success', () => {
      jest.spyOn(usersRepository, 'find').mockResolvedValue([mockUser])

      const result = service.list()

      expect(result).resolves.toEqual([mockUser])
    })
  })

  describe('getOne', () => { 
    it('success', () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(mockUser)

      const result = service.getOne('123')

      expect(result).resolves.toEqual(mockUser)
      expect(usersRepository.findOne).toHaveBeenCalledWith({ where: { id: '123' } })

    })

    it('not found', () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(null)

      const result = service.getOne('123')

      expect(result).rejects.toBeInstanceOf(NotFoundException)
      expect(result).rejects.toHaveProperty('message', 'User Not Found')
      expect(usersRepository.findOne).toHaveBeenCalledWith({ where: { id: '123' } })

    })
  })

  describe('delete', () => { 
    it('success', () => {
      jest.spyOn(usersRepository, 'softDelete').mockResolvedValue({
        generatedMaps: [],
        raw: [],
        affected: 1
      })

      const result = service.delete('123')

      expect(result).resolves.toEqual({ msg: 'User successfully deleted' })
      expect(usersRepository.softDelete).toHaveBeenCalledWith({ id: '123' })
    })
  })

  describe('update', () => { 
    it('success', () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(mockUser)

      const result = service.update(mockUser, '123')

      expect(result).resolves.toEqual({ msg: 'User has been updated' } )
      expect(usersRepository.findOne).toHaveBeenCalledWith({ where: { id: '123' } })

    })

    it('not found', () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(null)

      const result = service.update(mockUser, '123')

      expect(result).rejects.toBeInstanceOf(NotFoundException)
      expect(result).rejects.toHaveProperty('message', 'User Not Found')
      expect(usersRepository.findOne).toHaveBeenCalledWith({ where: { id: '123' } })

    })
  })
});
