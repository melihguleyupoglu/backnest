import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LoginUserDto } from 'src/users/dto/loginUserDto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { User } from '@prisma/client';
import { Response } from 'express';

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

  async login(user: LoginUserDto, res: Response): Promise<void> {
    const id = await this.usersService.getUserId(user.email);

    if (!id) {
      throw NotFoundException;
    }
    const payload = {
      email: user.email,
      id: id,
    };
    const { hashed, regular } = await this.generateRefreshToken(id);
    if (!regular || !id) {
      throw NotFoundException;
    }

    res.cookie('refresh_token', regular, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/auth/refresh',
    });

    const storeUser = await this.usersService.storeRefreshToken(
      user.email,
      hashed,
    );
    if (!storeUser) {
      throw new NotFoundException('Some error occured');
    }

    res.status(200).json({
      access_token: await this.jwtService.signAsync(payload, {
        expiresIn: '15m',
      }),
    });
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
