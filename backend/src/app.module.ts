import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { resolveEnv } from 'config/env';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { inspect } from 'util';
import { AuthModule } from './auth/auth.module';
import { ArchiveModule } from './archive/archive.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: resolveEnv(),
    }),
    MongooseModule.forRootAsync({
      useFactory: () => {
        const option = {
          uri: process.env.MONGODB_URI,
          dbName: process.env.MONGODB_DBNAME,
        };
        Logger.log(`Mongoose option: ${inspect(option)}`, 'Config');
        return option;
      },
    }),
    AuthModule,
    ArchiveModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
