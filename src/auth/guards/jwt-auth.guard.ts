import { Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../auth.service';
import { LoginUserDto } from 'src/users/dto/loginUserDto';
@Controller()
export class JwtAuthGuard {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req: LoginUserDto) {
    return this.authService.login({ email: req.email, password: req.password });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('jwt')
  getUserInfo(@Request() req: LoginUserDto) {
    return req.email;
  }
}
