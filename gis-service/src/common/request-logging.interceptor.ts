import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Observable, tap } from 'rxjs';

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const req = http.getRequest<{
      method: string;
      url: string;
      headers: Record<string, string | undefined>;
    }>();
    const res = http.getResponse<{ setHeader: (k: string, v: string) => void }>();

    const requestId =
      req.headers['x-request-id']?.trim() || randomUUID();
    res.setHeader('X-Request-Id', requestId);
    (req as { requestId?: string }).requestId = requestId;

    const started = Date.now();
    return next.handle().pipe(
      tap({
        next: () => {
          this.logger.log(
            `${req.method} ${req.url} ${Date.now() - started}ms rid=${requestId}`,
          );
        },
        error: (err: Error) => {
          this.logger.warn(
            `${req.method} ${req.url} FAIL ${Date.now() - started}ms rid=${requestId} ${err.message}`,
          );
        },
      }),
    );
  }
}
