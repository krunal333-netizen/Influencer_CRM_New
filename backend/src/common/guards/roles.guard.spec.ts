import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { ROLES_KEY, ROLE_SCOPE_KEY } from '../decorators/roles.decorator';
import { RoleScope } from '../enums/role-scope.enum';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  const createExecutionContext = (user: Partial<JwtPayload> = {}, params = {}, body = {}, query = {}): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user, params, body, query }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;

    guard = new RolesGuard(reflector);
  });

  it('allows execution when no role metadata is set', () => {
    reflector.getAllAndOverride.mockImplementation((key: string) => {
      if (key === ROLES_KEY) {
        return undefined;
      }
      return undefined;
    });

    const context = createExecutionContext();
    expect(guard.canActivate(context)).toBe(true);
  });

  it('throws when user lacks required role', () => {
    reflector.getAllAndOverride.mockImplementation((key: string) => {
      if (key === ROLES_KEY) {
        return ['ADMIN'];
      }
      if (key === ROLE_SCOPE_KEY) {
        return RoleScope.GLOBAL;
      }
      return undefined;
    });

    const context = createExecutionContext({ roles: ['COORDINATOR'] });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('enforces firm scope matching on params', () => {
    reflector.getAllAndOverride.mockImplementation((key: string) => {
      if (key === ROLES_KEY) {
        return ['ADMIN'];
      }
      if (key === ROLE_SCOPE_KEY) {
        return RoleScope.FIRM;
      }
      return undefined;
    });

    const context = createExecutionContext({ roles: ['ADMIN'], firmId: 'firm-1' }, { firmId: 'firm-2' });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('allows store-scoped access when firm IDs match', () => {
    reflector.getAllAndOverride.mockImplementation((key: string) => {
      if (key === ROLES_KEY) {
        return ['MANAGER'];
      }
      if (key === ROLE_SCOPE_KEY) {
        return RoleScope.STORE;
      }
      return undefined;
    });

    const context = createExecutionContext({ roles: ['MANAGER'], firmId: 'firm-1' }, { storeFirmId: 'firm-1' });
    expect(guard.canActivate(context)).toBe(true);
  });
});
