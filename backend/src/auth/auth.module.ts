import { Logger, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt'
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'src/users/schema/user.schema';
import { inspect } from 'util';
import { APP_GUARD } from '@nestjs/core'
import { AccessTokenGuard } from './guards/access-token.guard'
import { HashingService } from './hashing.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    JwtModule.registerAsync({
      useFactory: () => {
        const option = {
          secret: process.env.JWT_SECRET,
          audience: process.env.JWT_TOKEN_AUDIENCE,
          issuer: process.env.JWT_TOKEN_ISSUER,
          accessTokenTtl: parseInt(process.env.JWT_ACCESS_TOKEN_TTL, 10),
        }
        Logger.log(`JWT option: ${inspect(option)}`, 'Config')
        return option
      }
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
    HashingService,
  ]
})
export class AuthModule {}
