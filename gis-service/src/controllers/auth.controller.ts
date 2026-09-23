import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../decorators/public.decorator';
import { LoginDto } from '../dtos/login.dto';
import { AuthService } from '../services/auth.service';

@ApiTags('auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Đăng nhập JWT (ADMIN / HTX_FARMER)' })
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.username, dto.password);
  }

  @ApiBearerAuth('jwt')
  @Get('me')
  @ApiOperation({ summary: 'Thông tin user từ Bearer token' })
  async me(@Req() req: { user?: { sub: string } }) {
    if (!req.user?.sub) {
      throw new UnauthorizedException({
        code: 'ERR_AUTH_TOKEN_EXPIRED',
        message: 'Thiếu token đăng nhập.',
      });
    }
    const user = await this.auth.findById(req.user.sub);
    if (!user) {
      throw new UnauthorizedException({
        code: 'ERR_AUTH_TOKEN_EXPIRED',
        message: 'Tài khoản không còn hiệu lực.',
      });
    }
    return { code: 'SUCCESS', data: this.auth.toView(user) };
  }
}
