/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from 'src/dto/createUserDto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class UserService {
  async createUser(user: CreateUserDto) {
    const newUser = await prisma.user.create({
      data: {
        email: user.email,
        password: user.password,
        name: user.name,
      },
    });
  }

  removeUser(email: string) {}

  updateUser(email: string) {}

  listUsers() {}
}
