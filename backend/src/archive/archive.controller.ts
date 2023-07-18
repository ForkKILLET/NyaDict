import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { ArchiveService } from './archive.service';
import { UpsertArchiveDto } from './dto/upsert-archive.dto';

@Controller('archive')
export class ArchiveController {
  constructor(private readonly archiveService: ArchiveService) {}

  @Post('upload')
  createArchive(
    @Body() upsertedArchiveDto: UpsertArchiveDto,
    @Req() req: FastifyRequest,
  ) {
    return this.archiveService.upsert(req.user.sub, upsertedArchiveDto);
  }

  @Get('mine')
  getMyArchives(@Req() req: FastifyRequest) {
    return this.archiveService.findAllByOwner(req.user.sub);
  }

  @Get('mine/:id')
  getArchiveById(@Req() req: FastifyRequest, @Param('id') id: string) {
    return this.archiveService.findByIdPerUser(req.user.sub, id);
  }
}
