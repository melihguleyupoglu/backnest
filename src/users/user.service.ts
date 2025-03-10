/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from 'src/dto/createUserDto';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

@Injectable()
export class UserService {
  async createUser(user: CreateUserDto) {
    user.password = await this.hashPassword(user.password);
    const newUser = await prisma.user.create({
      data: {
        email: user.email,
        password: user.password,
        name: user.name,
      },
    });
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

  async removeUser(email: string) {}

  updateUser(email: string) {}

  async listUsers() {
    console.log(await prisma.user.findMany());
  }
}
