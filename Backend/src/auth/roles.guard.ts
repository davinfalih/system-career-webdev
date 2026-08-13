import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

export interface AuthUser {
  id: string;
  role: string;
  email: string;
  name: string;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly roles: string[]) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user: AuthUser | undefined = req.user;
    if (!user || !this.roles.includes(user.role)) {
      throw new ForbiddenException('Akses ditolak');
    }
    return true;
  }
}
