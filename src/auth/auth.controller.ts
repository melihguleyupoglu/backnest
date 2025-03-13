import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from 'src/users/dto/loginUserDto';

@Controller('/auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('/login')
  async handleLogin(@Body() user: LoginUserDto): Promise<object | undefined> {
    const isValidated = await this.authService.isValidated(user);
    if (isValidated) {
      return await this.authService.login(user);
    }
    return undefined;
  }
}
