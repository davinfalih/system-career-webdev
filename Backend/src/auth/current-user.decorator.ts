import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUser } from './roles.guard';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    return ctx.switchToHttp().getRequest().user;
  },
);
