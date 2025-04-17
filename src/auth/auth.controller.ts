import {
  Controller,
  Post,
  UseGuards,
  Get,
  Request,
  Body,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from 'src/users/dto/loginUserDto';
import { UsersService } from 'src/users/users.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Res } from '@nestjs/common';
import { Response } from 'express';
import { Request as ExpressRequest } from 'express';
import RefreshResponseInterface from './interfaces/refreshResponseInterface';

@Controller('/auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly usersService: UsersService,
  ) {}
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async handleLogin(
    @Request() req,
    @Body() body: LoginUserDto,
    @Res() res: Response,
  ) {
    return this.authService.login(body, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getUserInfo(@Request() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return req;
  }

  @Post('/refresh')
  async handleRefreshToken(
    @Req() req: ExpressRequest,
    @Res() res: Response,
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const refreshToken: string = req.cookies?.refresh_token;
    const response: RefreshResponseInterface =
      await this.authService.refreshTokens(refreshToken);
    const updatedAccessToken = response.accessToken;
    const updatedRefreshToken = response.refreshToken;

    res.cookie('refresh_token', updatedRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });
    res.cookie('access_token', updatedAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });
    res.status(200).json({ message: 'Token refreshed successfully' });
  }
  @Post('/logout')
  async handleLogout(@Req() req: ExpressRequest, @Res() res: Response) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }
    const decoded = (await this.authService.validateRefreshToken(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      refreshToken,
    )) as { userId: string };
    if (!decoded?.userId) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    await this.usersService.removeRefreshToken(Number(decoded.userId));
    res.clearCookie('refresh_token');
    return res.sendStatus(200);
  }
}
