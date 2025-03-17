import { Get, Post, UseGuards, Request, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../auth.service';
import { LoginUserDto } from 'src/users/dto/loginUserDto';
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private authService: AuthService) {
    super();
  }

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
