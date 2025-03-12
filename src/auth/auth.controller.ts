import { Controller } from '@nestjs/common';

@Controller('/login')
export class AuthController {
  constructor(private authService: AuthService) {}
}
