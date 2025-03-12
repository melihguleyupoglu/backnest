import {
  Body,
  Controller,
  Get,
  Post,
  Delete,
  Param,
  NotFoundException,
  Put,
  InternalServerErrorException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from 'src/dto/createUserDto';
import { UpdateUserDto } from 'src/dto/updateUserDto';

@Controller('/users')
export class UserController {
  constructor(private userService: UserService) {}
  @Post('/register')
  async handleUserCreation(@Body() user: CreateUserDto): Promise<object> {
    const createUser = await this.userService.createUser(user);
    if (!createUser) {
      throw new InternalServerErrorException('Failed to create user');
    }
    return {
      message: `${createUser} created successfully`,
      timestamp: new Date().toISOString(),
    };
  }
  @Get('/list')
  async handleUserListing(): Promise<object> {
    return await this.userService.listUsers();
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
    @Body() user: UpdateUserDto,
  ): Promise<object> {
    if (user.password) {
      user.password = await this.userService.hashPassword(user.password);
    }
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
