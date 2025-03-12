/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from 'src/dto/createUserDto';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from 'src/dto/updateUserDto';

const prisma = new PrismaClient();

@Injectable()
export class UserService {
  async createUser(user: CreateUserDto): Promise<string | undefined> {
    user.password = await this.hashPassword(user.password);
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

  async hashPassword(password: string): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(10);
      return await bcrypt.hash(password, salt);
    } catch (err) {
      console.error(err);
      return '';
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

  async listUsers() {
    console.log(await prisma.user.findMany());
  }
}
