import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ArchiveModule } from './archive/archive.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [AuthModule, ArchiveModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
