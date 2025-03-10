import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from 'src/dto/createUserDto';

@Controller('/register')
export class UserController {
  constructor(private userService: UserService) {}
  @Post()
  async handleUserCreation(
    @Body(new ValidationPipe({ whitelist: true })) user: CreateUserDto,
  ): Promise<void> {
    console.log(JSON.stringify(user, null, 2));
    await this.userService.createUser(user);
  }
}
