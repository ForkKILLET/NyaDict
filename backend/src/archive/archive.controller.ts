import { Controller } from '@nestjs/common';
import { ArchiveService } from './archive.service';

@Controller('archive')
export class ArchiveController {
  constructor(private readonly archiveService: ArchiveService) {}
}
