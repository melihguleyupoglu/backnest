import {
  Controller,
  Post,
  UseGuards,
  Get,
  Request,
  Body,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from 'src/users/dto/loginUserDto';
import { UsersService } from 'src/users/users.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('/auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly usersService: UsersService,
  ) {}
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async handleLogin(@Request() req, @Body() body: LoginUserDto) {
    return this.authService.login(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getUserInfo(@Request() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return req;
  }

  @Post('/refresh')
  async handleRefreshToken(
    @Body() user: { refreshToken: string; email: string },
  ): Promise<string | undefined> {
    if (
      (await this.authService.validateRefreshToken(user.refreshToken)) &&
      (await this.authService.compareRefreshToken(
        user.email,
        user.refreshToken,
      ))
    ) {
      const userId = await this.usersService.getUserId(user.email);
      if (userId) {
        return await this.authService.generateAccessToken({
          email: user.email,
          id: userId.toString(),
        });
      }
      return undefined;
    }
  }
}
