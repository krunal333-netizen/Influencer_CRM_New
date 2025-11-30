import { SetMetadata } from '@nestjs/common';
import { RoleScope } from '../enums/role-scope.enum';

export const ROLES_KEY = 'roles';
export const ROLE_SCOPE_KEY = 'role_scope';

export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
export const RoleScopeContext = (scope: RoleScope) => SetMetadata(ROLE_SCOPE_KEY, scope);
