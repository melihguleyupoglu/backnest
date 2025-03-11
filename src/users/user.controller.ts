import {
  Body,
  Controller,
  Get,
  Post,
  Delete,
  ValidationPipe,
  Param,
  NotFoundException,
  Put,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from 'src/dto/createUserDto';
import { UpdateUserDto } from 'src/dto/updateUserDto';

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
  @Put('/update/:email')
  async handleUserUpdate(
    @Param() params: { email: string },
    @Body(new ValidationPipe()) user: UpdateUserDto,
  ): Promise<object> {
    const updateUser = await this.userService.updateUser(params.email, user);
    if (!updateUser) {
      throw new NotFoundException('User not found');
    }
    return {
      message: `User updated successfully: ${updateUser}`,
      timestamp: new Date().toISOString(),
    };
  }
}
