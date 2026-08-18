import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * Khi API_KEY được cấu hình: mọi route không @Public() phải gửi X-API-Key.
 * Khi API_KEY trống (dev mặc định): cho phép tất cả — thuận tiện local.
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly config: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    if (context.getType() !== 'http') return true;

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const expected = this.config.get<string>('API_KEY')?.trim();
    if (!expected) return true;

    const req = context.switchToHttp().getRequest<{
      headers: Record<string, string | undefined>;
    }>();
    const provided =
      req.headers['x-api-key'] || req.headers['X-API-Key'] || '';
    if (provided !== expected) {
      throw new UnauthorizedException({
        code: 'ERR_AUTH_API_KEY',
        message: 'Thiếu hoặc sai X-API-Key.',
      });
    }
    return true;
  }
}
