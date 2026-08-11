import { HttpException, HttpStatus } from '@nestjs/common';
import { GisErrorCode } from './enums';

export class GisException extends HttpException {
  constructor(
    public readonly errorCode: GisErrorCode,
    message: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
    public readonly details?: Record<string, unknown>,
  ) {
    super(
      {
        code: errorCode,
        message,
        details: details ?? null,
      },
      status,
    );
  }
}
