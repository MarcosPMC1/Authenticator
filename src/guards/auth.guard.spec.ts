import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(), // Mock the verifyAsync method of JwtService
          },
        },
      ],
    }).compile();

    authGuard = module.get<AuthGuard>(AuthGuard);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(authGuard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should throw UnauthorizedException if no token is provided', async () => {
      const mockRequest = { headers: {} } as Request;
      const context = { switchToHttp: () => ({ getRequest: () => mockRequest }) } as ExecutionContext;

      await expect(authGuard.canActivate(context)).rejects.toThrowError(UnauthorizedException);
    });

    it('should throw UnauthorizedException if the token is invalid', async () => {
      const mockRequest = { headers: { authorization: 'Bearer invalidToken' } } as Request;
      const context = { switchToHttp: () => ({ getRequest: () => mockRequest }) } as ExecutionContext;

      jwtService.verifyAsync = jest.fn().mockRejectedValue(new Error('Invalid token'));

      await expect(authGuard.canActivate(context)).rejects.toThrowError(UnauthorizedException);
    });

    it('should add the user to the request if the token is valid', async () => {
      const mockRequest = { headers: { authorization: 'Bearer validToken' } } as Request;
      const context = { switchToHttp: () => ({ getRequest: () => mockRequest }) } as ExecutionContext;
      const mockPayload = { userId: 1, username: 'testUser' };

      jwtService.verifyAsync = jest.fn().mockResolvedValue(mockPayload);

      const result = await authGuard.canActivate(context);

      expect(result).toBe(true);
      expect(mockRequest['user']).toEqual(mockPayload);
    });
  });
});
