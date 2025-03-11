import {
  Body,
  Controller,
  Get,
  Post,
  Delete,
  ValidationPipe,
  Param,
  NotFoundException,
} from '@nestjs/common';
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
  @Delete('/delete/:email')
  async handleUserRemoval(@Param() params: { email: string }): Promise<object> {
    const deletedUser = await this.userService.removeUser(params.email);
    if (!deletedUser) {
      throw new NotFoundException('User not found');
    }
    return {
      message: `User deleted successfully: ${deletedUser}`,
      timestamp: new Date().toISOString(),
    };
  }
}
