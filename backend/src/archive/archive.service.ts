import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpsertArchiveDto } from './dto/upsert-archive.dto';

@Injectable()
export class ArchiveService {
  constructor(private prisma: PrismaService) {}

  async upsert(owner: string, data: UpsertArchiveDto) {
    try {
      const size = Buffer.byteLength(data.content, 'utf-8');
      return this.prisma.archive.upsert({
        create: {
          ...data,
          owner,
          size,
          accessTime: new Date(),
        },
        update: {
          content: data.content,
          size,
          accessTime: new Date(),
        },
        where: {
          owner_idPerUser: {
            owner,
            idPerUser: data.idPerUser,
          },
        },
      });
    } catch (error) {
      throw new BadRequestException('アーカイブ・データは破損しました');
    }
  }

  findAllByOwner(owner: string) {
    return this.prisma.archive.findMany({
      select: {
        id: true,
        idPerUser: true,
        owner: true,
        title: true,
        wordCount: true,
        public: true,
        size: true,
        accessTime: true,
        version: true,
      },
      where: {
        owner,
      },
    });
  }

  findByIdPerUser(owner: string, idPerUser: string) {
    return this.prisma.archive.findUnique({
      where: {
        owner_idPerUser: {
          owner,
          idPerUser,
        },
      },
    });
  }
}
