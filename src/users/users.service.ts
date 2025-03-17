import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/createUserDto';
import { PrismaClient, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from 'src/users/dto/updateUserDto';
const prisma = new PrismaClient();

@Injectable()
export class UsersService {
  async createUser(user: CreateUserDto): Promise<string | undefined> {
    const hashedPassword = await this.hashPassword(user.password);
    if (hashedPassword) {
      user.password = hashedPassword;
    }
    try {
      const newUser = await prisma.user.create({
        data: {
          email: user.email,
          password: user.password,
          name: user.name,
        },
      });
      return newUser.email;
    } catch (err) {
      console.error(err);
      return undefined;
    }
  }

  async hashPassword(password: string): Promise<string | undefined> {
    try {
      const salt = await bcrypt.genSalt(10);
      return await bcrypt.hash(password, salt);
    } catch (err) {
      console.error(err);
      return undefined;
    }
  }

  async removeUser(email: string): Promise<string | undefined> {
    try {
      const deleteUser = await prisma.user.delete({
        where: {
          email: email,
        },
      });
      return deleteUser.email;
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (err.code === 'P2025') {
        throw new NotFoundException(`User with ${email} not found.`);
      }
      throw new InternalServerErrorException(
        'An error occurred while deleting the user.',
      );
    }
  }

  async updateUser(
    email: string,
    user: UpdateUserDto,
  ): Promise<string | undefined> {
    try {
      const updateUser = await prisma.user.update({
        where: {
          email: email,
        },
        data: {
          name: user.name,
          password: user.password,
        },
      });
      return updateUser.email;
    } catch (err) {
      console.error(err);
      return undefined;
    }
  }

  async listUsers(): Promise<object> {
    try {
      return await prisma.user.findMany();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      throw new InternalServerErrorException('Failed to fetch users:');
    }
  }

  async findUser(email: string): Promise<User | undefined> {
    try {
      const dbUser = await prisma.user.findUnique({
        where: {
          email: email,
        },
      });
      if (dbUser) {
        return dbUser;
      }
    } catch (err) {
      console.error(err);
      return undefined;
    }
  }

  async getUserId(email: string): Promise<number | undefined> {
    try {
      const user = await prisma.user.findUnique({
        where: {
          email: email,
        },
      });
      if (user) {
        return user['id'];
      }
    } catch (err) {
      console.error(err);
      return undefined;
    }
  }

  async storeRefreshToken(email: string, refreshToken: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const user = await prisma.user.update({
      where: {
        email: email,
      },
      data: {
        refresh_token: refreshToken,
      },
    });
  }
}
