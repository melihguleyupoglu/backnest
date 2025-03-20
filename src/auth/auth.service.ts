import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LoginUserDto } from 'src/users/dto/loginUserDto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { LoginResponseDto } from '../users/dto/loginResponseDto';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}
  async validateUser(user: LoginUserDto): Promise<User | void> {
    const dbUser = await this.usersService.findUser(user.email);

    if (!dbUser) {
      throw new BadRequestException('User not found');
    }
    const isMatch: boolean = await bcrypt.compare(
      user.password,
      dbUser.password,
    );
    if (!isMatch) {
      throw new BadRequestException('Password does not match');
    }
    return dbUser;
  }

  async login(user: LoginUserDto): Promise<LoginResponseDto> {
    const id = await this.usersService.getUserId(user.email);
    if (!id) {
      throw NotFoundException;
    }
    const payload = {
      email: user.email,
      id: id,
    };
    const refreshToken = await this.generateRefreshToken(id);
    if (!refreshToken || !id) {
      throw NotFoundException;
    }
    await this.usersService.storeRefreshToken(user.email, refreshToken);
    return {
      access_token: await this.jwtService.signAsync(payload, {
        expiresIn: '15m',
      }),
      refresh_token: refreshToken,
    };
  }

  async generateRefreshToken(userId: number): Promise<string | undefined> {
    try {
      const salt = await bcrypt.genSalt();
      const refreshToken = await this.jwtService.signAsync(
        { userId },
        { expiresIn: '15m' },
      );
      const hash = bcrypt.hash(refreshToken, salt);
      return hash;
    } catch (err) {
      console.error(err);
      return undefined;
    }
  }

  async generateAccessToken(payload: {
    email: string;
    id: string;
  }): Promise<string> {
    return this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });
  }

  async validateRefreshToken(refreshToken: string): Promise<object> {
    return await this.jwtService.verifyAsync(refreshToken);
  }

  async compareRefreshToken(
    email: string,
    refreshToken: string,
  ): Promise<boolean | void> {
    const dbRefreshToken = await this.usersService.getRefreshToken(email);
    if (dbRefreshToken) {
      return bcrypt.compare(refreshToken, dbRefreshToken);
    }
  }
}
