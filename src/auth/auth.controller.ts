import { Controller, Post } from '@nestjs/common';

@Controller('/auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('/login')
  async handleLogin() {}
}
