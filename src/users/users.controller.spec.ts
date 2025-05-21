import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtService } from '@nestjs/jwt';
import { Role } from '../enums/role.enum';
import { Users } from './entities/users.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

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
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            getOne: jest.fn(),
            list: jest.fn(),
            update: jest.fn(),
            delete: jest.fn()
          }
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

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('usersService should be defined', () => {
    expect(usersService).toBeDefined();
  });


  describe('getUser', () => {
    it('success', () => {
      jest.spyOn(usersService, 'getOne').mockResolvedValue(mockUser)

      const result = controller.getUser('123')

      expect(result).resolves.toEqual(mockUser)
      expect(usersService.getOne).toHaveBeenCalledWith('123')
    })
  })

  describe('getUsers', () => {
    it('success', () => {
      jest.spyOn(usersService, 'list').mockResolvedValue([mockUser])

      const result = controller.getUsers()

      expect(result).resolves.toEqual([mockUser])
      expect(usersService.list).toHaveBeenCalled()
    })
  })

  describe('update', () => {
    it('success', () => {
      jest.spyOn(usersService, 'update').mockResolvedValue({ msg: 'User has been updated' })

      const result = controller.updateUser(mockUser, '123')

      expect(result).resolves.toEqual({ msg: 'User has been updated' })
      expect(usersService.update).toHaveBeenCalledWith(mockUser, '123')
    })
  })

  describe('update', () => {
    it('success', () => {
      jest.spyOn(usersService, 'delete').mockResolvedValue({ msg: 'User successfully deleted' })

      const result = controller.deleteUser('123')

      expect(result).resolves.toEqual({ msg: 'User successfully deleted' })
      expect(usersService.delete).toHaveBeenCalledWith('123')
    })
  })
});
