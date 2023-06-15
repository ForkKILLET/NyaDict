import { Module } from '@nestjs/common';
import { ArchiveService } from './archive.service';
import { ArchiveController } from './archive.controller';

@Module({
  controllers: [ArchiveController],
  providers: [ArchiveService]
})
export class ArchiveModule {}
