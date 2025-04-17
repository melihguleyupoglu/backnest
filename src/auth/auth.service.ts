import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginUserDto } from 'src/users/dto/loginUserDto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { User } from '@prisma/client';
import RefreshResponseInterface from './interfaces/refreshResponseInterface';
import LoginResponse from './interfaces/loginResponse';

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

  async login(user: LoginUserDto): Promise<LoginResponse> {
    const id = await this.usersService.getUserId(user.email);

    if (!id) {
      throw new NotFoundException('User not found');
    }
    const payload = {
      email: user.email,
      id: id,
    };
    const { hashed, regular } = await this.generateRefreshToken(id);
    if (!regular || !id) {
      throw new NotFoundException('Some error occurred');
    }

    const storeUser = await this.usersService.storeRefreshToken(id, hashed);
    if (!storeUser) {
      throw new NotFoundException('Some error occured');
    }

    return {
      accessToken: await this.jwtService.signAsync(payload, {
        expiresIn: '15m',
      }),
      refreshToken: regular,
    };
  }

  async generateRefreshToken(
    userId: number,
  ): Promise<{ hashed: string; regular: string }> {
    try {
      const salt = await bcrypt.genSalt();
      const refreshToken = await this.jwtService.signAsync(
        { userId },
        { expiresIn: '15m' },
      );
      const hash = await bcrypt.hash(refreshToken, salt);
      return { hashed: hash, regular: refreshToken };
    } catch (err) {
      console.error(err);
      throw new BadRequestException();
    }
  }

  async generateAccessToken(payload: {
    email: string;
    id: number;
  }): Promise<string> {
    return this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });
  }

  async validateRefreshToken(refreshToken: string): Promise<object> {
    return await this.jwtService.verifyAsync(refreshToken);
  }

  async refreshTokens(refreshToken: string): Promise<RefreshResponseInterface> {
    const decoded = (await this.validateRefreshToken(refreshToken)) as {
      userId: string;
    };

    if (!decoded.userId) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const user = await this.usersService.findUserById(Number(decoded.userId));
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const updatedRefreshToken = await this.generateRefreshToken(user.id);
    const updatedAccessToken = await this.generateAccessToken({
      email: user.email,
      id: user.id,
    });

    await this.usersService.storeRefreshToken(
      user.id,
      updatedRefreshToken.hashed,
    );
    return {
      accessToken: updatedAccessToken,
      refreshToken: updatedRefreshToken.regular,
    };
  }
}
