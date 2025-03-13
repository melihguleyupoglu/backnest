import { Injectable } from '@nestjs/common';
import { LoginUserDto } from 'src/users/dto/loginUserDto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}
  async isAuthenticated(user: LoginUserDto): Promise<boolean | void> {
    try {
      const dbUser = await this.usersService.findUser(user.email);

      if (dbUser) {
        return bcrypt.compare(user.password, dbUser.password);
      }
    } catch (err) {
      console.error(err);
    }
  }

  // async login(user: LoginUserDto): Promise<string | undefined> {
  //   const payload = { email: user.email, id: user.id };
  // }

  async generateAccessToken(
    userId: string,
    email: string,
  ): Promise<string | undefined> {
    try {
      return this.jwtService.signAsync({ userId, email }, { expiresIn: '15m' });
    } catch (err) {
      console.error(err);
      return undefined;
    }
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
