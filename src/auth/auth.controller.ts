import { Controller, Post, UseGuards, Get, Request } from '@nestjs/common';
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
  async login(@Request() req: LoginUserDto) {
    return this.authService.login(req);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getUserInfo(@Request() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return req;
  }
  // @Post('/refresh')
  // async handleRefreshToken(
  //   @Body() refreshToken: string,
  // ): Promise<object | undefined> {}
}
