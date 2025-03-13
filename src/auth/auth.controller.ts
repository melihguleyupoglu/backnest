import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from 'src/users/dto/loginUserDto';

@Controller('/auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('/login')
  async handleLogin(@Body() user: LoginUserDto) {
    const isAuthenticated = await this.authService.isAuthenticated(user);
    console.log(isAuthenticated);
  }
}
