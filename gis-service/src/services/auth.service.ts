import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { GisErrorCode } from '../common/enums';
import { GisException } from '../common/gis.exception';
import { AppUserEntity } from '../entities/app-user.entity';

export interface AuthUserView {
  id: string;
  username: string;
  name: string;
  role: 'ADMIN' | 'HTX_FARMER';
  phone: string | null;
  cooperativeName: string | null;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AppUserEntity)
    private readonly users: Repository<AppUserEntity>,
    private readonly jwt: JwtService,
  ) {}

  toView(user: AppUserEntity): AuthUserView {
    return {
      id: user.id,
      username: user.username,
      name: user.fullName,
      role: user.role,
      phone: user.phone,
      cooperativeName: user.cooperativeName,
    };
  }

  async login(username: string, password: string) {
    const user = await this.users.findOne({
      where: { username: username.trim().toLowerCase() },
    });
    if (!user) {
      throw new GisException(
        GisErrorCode.INVALID_CREDENTIALS,
        'Sai tên đăng nhập hoặc mật khẩu.',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      throw new GisException(
        GisErrorCode.INVALID_CREDENTIALS,
        'Sai tên đăng nhập hoặc mật khẩu.',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const view = this.toView(user);
    const access_token = await this.jwt.signAsync({
      sub: user.id,
      username: user.username,
      role: user.role,
      name: user.fullName,
    });
    return {
      code: 'SUCCESS',
      message: 'Đăng nhập thành công.',
      data: { access_token, user: view },
    };
  }

  async findById(id: string): Promise<AppUserEntity | null> {
    return this.users.findOne({ where: { id } });
  }
}
