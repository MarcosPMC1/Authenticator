import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Role } from '../enums/role.enum';
import { ROLES_KEY } from '../enums/roles.decorator';

describe('RolesGuard', () => {
  let rolesGuard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    rolesGuard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(rolesGuard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should allow access if no roles are required', () => {
      // Mocking Reflector to return undefined (no roles)
      reflector.getAllAndOverride = jest.fn().mockReturnValue(undefined);

      const mockRequest = { user: { roles: [Role.Admin] } };
      const context = {
        switchToHttp: () => ({ getRequest: () => mockRequest }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      const result = rolesGuard.canActivate(context);
      expect(result).toBe(true);  // Should allow access
    });

    it('should allow access if user has required role', () => {
      const requiredRoles = [Role.Admin];
      // Mocking Reflector to return the required roles
      reflector.getAllAndOverride = jest.fn().mockReturnValue(requiredRoles);

      const mockRequest = { user: { roles: [Role.Admin] } };
      const context = {
        switchToHttp: () => ({ getRequest: () => mockRequest }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      const result = rolesGuard.canActivate(context);
      expect(result).toBe(true);  // Should allow access since the user has the role
    });

    it('should deny access if user does not have required role', () => {
      const requiredRoles = [Role.Admin];
      // Mocking Reflector to return the required roles
      reflector.getAllAndOverride = jest.fn().mockReturnValue(requiredRoles);

      const mockRequest = { user: { roles: [Role.User] } };
      const context = {
        switchToHttp: () => ({ getRequest: () => mockRequest }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      const result = rolesGuard.canActivate(context);
      expect(result).toBe(false);  // Should deny access since the user doesn't have the role
    });

    it('should deny access if user has no roles', () => {
      const requiredRoles = [Role.Admin];
      // Mocking Reflector to return the required roles
      reflector.getAllAndOverride = jest.fn().mockReturnValue(requiredRoles);

      const mockRequest = { user: { roles: [] } };  // No roles for the user
      const context = {
        switchToHttp: () => ({ getRequest: () => mockRequest }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      const result = rolesGuard.canActivate(context);
      expect(result).toBe(false);  // Should deny access since the user has no roles
    });
  });
});
