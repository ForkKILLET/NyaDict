import { Logger, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { inspect } from 'util';
import { APP_GUARD } from '@nestjs/core';
import { AccessTokenGuard } from './guards/access-token.guard';
import { HashingService } from './hashing.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => {
        const option: JwtModuleOptions = {
          secret: process.env.JWT_SECRET,
          signOptions: {
            audience: process.env.JWT_TOKEN_AUDIENCE,
            issuer: process.env.JWT_TOKEN_ISSUER,
          },
          verifyOptions: {
            audience: process.env.JWT_TOKEN_AUDIENCE,
            issuer: process.env.JWT_TOKEN_ISSUER,
          },
        };
        Logger.log(`JWT option: ${inspect(option)}`, 'Config');
        return option;
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    PrismaService,
    AuthService,
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
    HashingService,
  ],
})
export class AuthModule {}
