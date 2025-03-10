import { Controller, Post } from '@nestjs/common';
import { User } from './user.model';

@Controller('/register')
export class UserController {
  @Post()
  async createUser(user: User): Promise<User> {}
}
