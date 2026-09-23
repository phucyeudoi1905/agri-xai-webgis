import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

export interface JwtPayload {
  sub: string;
  username: string;
  role: 'ADMIN' | 'HTX_FARMER';
  name: string;
}

/**
 * Route không @Public():
 * - Bearer JWT hợp lệ, hoặc
 * - X-API-Key khớp (webhook AI / smoke), hoặc
 * - Cả JWT_SECRET và API_KEY đều trống (dev mở).
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly config: ConfigService,
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType() !== 'http') return true;

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest<{
      headers: Record<string, string | undefined>;
      user?: JwtPayload;
    }>();

    const authHeader = req.headers.authorization || req.headers.Authorization || '';
    const bearer = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : '';
    const jwtSecret = this.config.get<string>('JWT_SECRET')?.trim();
    if (bearer && jwtSecret) {
      try {
        req.user = await this.jwt.verifyAsync<JwtPayload>(bearer);
        return true;
      } catch {
        throw new UnauthorizedException({
          code: 'ERR_AUTH_TOKEN_EXPIRED',
          message: 'Token JWT hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.',
        });
      }
    }

    const expectedKey = this.config.get<string>('API_KEY')?.trim();
    const provided =
      req.headers['x-api-key'] || req.headers['X-API-Key'] || '';
    if (expectedKey && provided === expectedKey) {
      return true;
    }

    if (!jwtSecret && !expectedKey) {
      return true;
    }

    throw new UnauthorizedException({
      code: 'ERR_AUTH_TOKEN_EXPIRED',
      message: 'Cần đăng nhập JWT (Authorization: Bearer) hoặc X-API-Key.',
    });
  }
}
