import { Controller, Post } from '@nestjs/common';
import { User } from './user.model';
import { UserService } from './user.service';

@Controller('/register')
export class UserController {
  constructor(private userService: UserService) {}
  @Post()
  async createUser(user: User): Promise<void> {}
}
