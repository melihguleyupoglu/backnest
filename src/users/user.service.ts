import { Injectable } from '@nestjs/common';
import { User } from './user.model';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class UserService {
  async createUser(user: User) {
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
