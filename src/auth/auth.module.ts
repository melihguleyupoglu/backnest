import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [JwtModule.register({ secret: process.env.JWT_SECRET })],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
