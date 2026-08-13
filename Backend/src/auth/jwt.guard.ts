import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export interface JwtPayload {
  sub: string;
  role: string;
  email: string;
  name: string;
  companyId?: string | null;
  institutionId?: string | null;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const token = this.extractToken(req);
    if (!token) throw new UnauthorizedException('Belum login');
    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      req.user = {
        id: payload.sub,
        role: payload.role,
        email: payload.email,
        name: payload.name,
        companyId: payload.companyId ?? null,
        institutionId: payload.institutionId ?? null,
      };
      return true;
    } catch {
      throw new UnauthorizedException('Sesi tidak valid');
    }
  }

  private extractToken(req: any): string | null {
    if (req.headers?.authorization?.startsWith('Bearer ')) {
      return req.headers.authorization.slice(7);
    }
    if (req.cookies?.token) return req.cookies.token;
    return null;
  }
}
