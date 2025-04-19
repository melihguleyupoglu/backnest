import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/createUserDto';
import {
  PrismaClient,
  User,
  UserSession as PrismaUserSession,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from 'src/users/dto/updateUserDto';
import UserSession from './entities/userSession.entity';
const prisma = new PrismaClient();

@Injectable()
export class UsersService {
  async createUser(user: CreateUserDto): Promise<string | undefined> {
    const isAlreadySignedUp = await prisma.user.findUnique({
      where: {
        email: user.email,
      },
    });
    if (isAlreadySignedUp) {
      throw new BadRequestException('User already registered.');
    }
    const hashedPassword = await this.hashPassword(user.password);
    if (hashedPassword) {
      user.password = hashedPassword;
    }
    try {
      const newUser = await prisma.user.create({
        data: {
          email: user.email,
          password: user.password,
        },
      });
      return newUser.email;
    } catch (err) {
      console.error(err);
      return undefined;
    }
  }

  async hashPassword(password: string): Promise<string | undefined> {
    try {
      const salt = await bcrypt.genSalt(10);
      return await bcrypt.hash(password, salt);
    } catch (err) {
      console.error(err);
      return undefined;
    }
  }

  async removeUser(email: string): Promise<string | undefined> {
    try {
      // Önce kullanıcıyı bulalım
      const user = await prisma.user.findUnique({
        where: { email },
        include: { sessions: true },
      });

      if (!user) {
        throw new NotFoundException(`User with ${email} not found.`);
      }

      // İlişkili tüm oturumları silelim
      if (user.sessions.length > 0) {
        await prisma.userSession.deleteMany({
          where: { userId: user.id },
        });
      }

      // Şimdi kullanıcıyı silebiliriz
      const deleteUser = await prisma.user.delete({
        where: {
          email: email,
        },
      });
      return deleteUser.email;
    } catch (err) {
      console.log(err);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (err.code === 'P2025') {
        throw new NotFoundException(`User with ${email} not found.`);
      }
      throw new InternalServerErrorException(
        'An error occurred while deleting the user.',
      );
    }
  }

  async updateUser(
    email: string,
    user: UpdateUserDto,
  ): Promise<string | undefined> {
    try {
      const updateUser = await prisma.user.update({
        where: {
          email: email,
        },
        data: {
          password: user.password,
        },
      });
      if (!updateUser) {
        throw new UnauthorizedException('User not found');
      }
      return updateUser.email;
    } catch (err) {
      console.error(err);
      return undefined;
    }
  }

  async listUsers(): Promise<object> {
    try {
      return await prisma.user.findMany();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      throw new InternalServerErrorException('Failed to fetch users:');
    }
  }

  async findUser(email: string): Promise<User | undefined> {
    try {
      const dbUser = await prisma.user.findUnique({
        where: {
          email: email,
        },
      });
      if (dbUser) {
        return dbUser;
      }
    } catch (err) {
      console.error(err);
      return undefined;
    }
  }

  async getUserId(email: string): Promise<number | undefined> {
    if (!email) {
      console.error('Email is required but got an empty value');
      return undefined;
    }
    try {
      const user = await prisma.user.findUnique({
        where: {
          email: email,
        },
      });
      if (user) {
        return user.id;
      }
      return undefined;
    } catch (err) {
      console.error(err);
      return undefined;
    }
  }

  async storeRefreshToken(
    userId: number,
    refreshToken: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<UserSession> {
    // Önce kullanıcının var olduğunu kontrol edelim
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { sessions: true },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    let session: PrismaUserSession;

    if (userAgent) {
      // Aynı userAgent'a sahip bir oturum var mı kontrol edelim
      const existingSession = existingUser.sessions.find(
        (session) => session.userAgent === userAgent,
      );

      if (existingSession) {
        // Aynı cihazdan login olduysa, mevcut oturumu güncelle
        session = await prisma.userSession.update({
          where: { id: existingSession.id },
          data: {
            refreshToken,
            ipAddress,
            updatedAt: new Date(),
          },
        });
      } else {
        // Yeni bir cihazdan login olduysa, yeni bir oturum oluştur
        session = await prisma.userSession.create({
          data: {
            refreshToken,
            userAgent,
            ipAddress,
            user: { connect: { id: userId } },
          },
        });
      }
    } else {
      // UserAgent bilgisi yoksa, sadece ilk oturumu güncelle veya yeni bir oturum oluştur
      if (existingUser.sessions.length > 0) {
        session = await prisma.userSession.update({
          where: { id: existingUser.sessions[0].id },
          data: { refreshToken },
        });
      } else {
        session = await prisma.userSession.create({
          data: {
            refreshToken,
            user: { connect: { id: userId } },
          },
        });
      }
    }

    // Prisma UserSession tipinden kendi UserSession tipimize dönüştürelim
    const userSession: UserSession = {
      id: session.id,
      userId: session.userId,
      refreshToken: session.refreshToken,
      userAgent: session.userAgent,
      ipAddress: session.ipAddress,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      expiresAt: session.expiresAt,
    };

    return userSession;
  }

  async getRefreshTokenByUserId(userId: number): Promise<string | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { sessions: true },
    });

    if (!user || user.sessions.length === 0) {
      throw new NotFoundException('User session not found');
    }

    // sessions array içerisindeki ilk elemanın refreshToken değerini dönüyoruz
    return user.sessions[0].refreshToken;
  }

  async findUserById(userId: number): Promise<User> {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async removeRefreshToken(userId: number): Promise<UserSession> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { sessions: true },
    });

    if (!user || user.sessions.length === 0) {
      throw new UnauthorizedException('User session not found');
    }

    const session: PrismaUserSession = await prisma.userSession.update({
      where: { id: user.sessions[0].id },
      data: { refreshToken: '' },
    });

    // Prisma UserSession tipinden kendi UserSession tipimize dönüştürelim
    const userSession: UserSession = {
      id: session.id,
      userId: session.userId,
      refreshToken: session.refreshToken,
      userAgent: session.userAgent,
      ipAddress: session.ipAddress,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      expiresAt: session.expiresAt,
    };

    return userSession;
  }
}
