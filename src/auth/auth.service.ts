import { BadRequestException, Injectable } from '@nestjs/common';
import { LoginUserDto } from 'src/users/dto/loginUserDto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { LoginResponseDto } from '../users/dto/loginResponseDto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}
  async isValidated(user: LoginUserDto): Promise<boolean | void> {
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
    return true;
  }

  async login(user: LoginUserDto): Promise<LoginResponseDto> {
    const payload = {
      email: user.email,
      id: await this.usersService.getUserId(user.email),
    };
    return {
      access_token: await this.jwtService.signAsync(payload, {
        expiresIn: '15m',
      }),
      refresh_token: await this.jwtService.signAsync(payload, {
        expiresIn: '7d',
      }),
    };
  }

  async generateRefreshToken(userId: string): Promise<string | undefined> {
    try {
      return this.jwtService.signAsync({ userId }, { expiresIn: '15m' });
    } catch (err) {
      console.error(err);
      return undefined;
    }
  }
}
