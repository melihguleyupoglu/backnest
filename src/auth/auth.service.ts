import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { LoginUserDto } from 'src/dto/loginUserDto';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

@Injectable()
export class AuthService {
  async isAuthenticated(user: LoginUserDto): Promise<boolean | void> {
    try {
      const dbUser = await prisma.user.findUnique({
        where: {
          email: user.email,
        },
      });
      const dbPassword = dbUser?.password;
      if (dbPassword) {
        return bcrypt.compare(user.password, dbPassword);
      }
    } catch (err) {
      console.error(err);
      return undefined;
    }
  }
}
