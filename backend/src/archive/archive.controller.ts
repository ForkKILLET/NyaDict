import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { ArchiveService } from './archive.service';
import { AddArchiveDto } from './dto/add-archive.dto';

@Controller('archive')
export class ArchiveController {
  constructor(private readonly archiveService: ArchiveService) {}

  @Post('upload')
  uploadArchive(
    @Body() addArchiveDto: AddArchiveDto,
    @Req() req: FastifyRequest,
  ) {
    return this.archiveService.create(req.user.sub, addArchiveDto);
  }

  @Get('mine')
  getMyArchives(@Req() req: FastifyRequest) {
    return this.archiveService.findAllByOwner(req.user.sub);
  }

  @Get('mine/:id')
  getArchiveById(@Req() req: FastifyRequest, @Param('id') id: string) {
    return this.archiveService.findById(req.user.sub, id);
  }
}
