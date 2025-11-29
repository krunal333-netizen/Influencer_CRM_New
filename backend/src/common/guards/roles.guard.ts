import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ROLE_SCOPE_KEY, ROLES_KEY } from '../decorators/roles.decorator';
import { RoleScope } from '../enums/role-scope.enum';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request & { user?: JwtPayload }>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    const hasRole = requiredRoles.some((role) => user.roles?.includes(role));
    if (!hasRole) {
      throw new ForbiddenException('Insufficient role for this action');
    }

    const scope = this.reflector.getAllAndOverride<RoleScope | undefined>(ROLE_SCOPE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!scope || scope === RoleScope.GLOBAL) {
      return true;
    }

    if (!user.firmId) {
      throw new ForbiddenException('Firm context required to access this resource');
    }

    const scopedFirmId = this.extractFirmContext(request, scope);
    if (!scopedFirmId) {
      throw new ForbiddenException('Firm identifier must be provided for scoped routes');
    }

    if (scopedFirmId !== user.firmId) {
      throw new ForbiddenException('Requested resource belongs to another firm');
    }

    return true;
  }

  private extractFirmContext(request: Request, scope: RoleScope): string | null {
    if (scope === RoleScope.FIRM) {
      return this.lookupFirmId(request);
    }

    if (scope === RoleScope.STORE) {
      return (
        request.params?.firmId ||
        request.params?.storeFirmId ||
        request.body?.firmId ||
        request.query?.firmId ||
        null
      );
    }

    return null;
  }

  private lookupFirmId(request: Request): string | null {
    return request.params?.firmId || request.body?.firmId || request.query?.firmId || null;
  }
}
