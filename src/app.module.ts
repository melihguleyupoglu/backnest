import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UserController } from './users/user.controller';
import { UserService } from './users/user.service';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController, UserController],
  providers: [AppService, UserService],
})
export class AppModule {}
