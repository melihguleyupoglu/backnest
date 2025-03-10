import { Body, Controller, Get, Post, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from 'src/dto/createUserDto';

@Controller('/users')
export class UserController {
  constructor(private userService: UserService) {}
  @Post('/register')
  async handleUserCreation(
    @Body(new ValidationPipe({ whitelist: true })) user: CreateUserDto,
  ): Promise<void> {
    await this.userService.createUser(user);
  }
  @Get('/list')
  async handleUserListing() {
    console.log(await this.userService.listUsers());
  }
}
