import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';

export const CurrentUser = createParamDecorator<keyof JwtPayload | undefined>((data, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<{ user?: JwtPayload }>();
  const user = request.user;
  if (!data) {
    return user;
  }

  return user?.[data];
});
