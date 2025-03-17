import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from 'src/users/dto/loginUserDto';
import { UsersService } from 'src/users/users.service';

@Controller('/auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly usersService: UsersService,
  ) {}
  @Post('/login')
  async handleLogin(@Body() user: LoginUserDto): Promise<object | undefined> {
    const isValidated = await this.authService.isValidated(user);
    if (isValidated) {
      const { access_token, refresh_token } =
        await this.authService.login(user);
      await this.usersService.storeRefreshToken(user.email, refresh_token);
      return { access_token, refresh_token };
    }
    return undefined;
  }
  @Post('/refresh')
  async handleRefreshToken(
    @Body() refreshToken: string,
  ): Promise<object | undefined> {}
}
