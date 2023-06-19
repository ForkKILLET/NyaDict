import { Module } from '@nestjs/common';
import { ArchiveService } from './archive.service';
import { ArchiveController } from './archive.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [ArchiveController],
  providers: [
    PrismaService,
    ArchiveService,
  ],
})
export class ArchiveModule {}
