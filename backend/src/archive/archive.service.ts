import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/user.schema';
import { Archive, ArchiveT } from 'src/schemas/archive.schema';
import { AddArchiveDto } from './dto/add-archive.dto';

@Injectable()
export class ArchiveService {
  constructor(
    @InjectModel('User') private user: Model<User>,
    @InjectModel('Archive') private archive: Model<Archive>,
  ) {}

  create(owner: string, addArchiveDto: AddArchiveDto) {
    try {
      const data: [] = JSON.parse(addArchiveDto.content);
      const size = Buffer.byteLength(addArchiveDto.content, 'utf-8');
      const wordCount = data.length;
      return this.archive.create({
        owner,
        wordCount,
        size,
        ...addArchiveDto,
      });
    } catch (error) {
      throw new BadRequestException('アーカイブ・データは破損しました');
    }
  }

  async findAllByOwner(owner: string): Promise<ArchiveT[]> {
    const archives = await this.archive.find(
      { owner },
      {
        _id: true,
        owner: true,
        title: true,
        wordCount: true,
        public: true,
        size: true,
        accessTime: true,
      },
    );
    return archives.map((archive) => ({
      ...archive.toJSON(),
      accessTime: +archive.accessTime,
      createTime: +archive.createTime,
    }));
  }

  findById(owner: string, id: string) {
    return this.archive.findOne({ _id: id, owner });
  }
}
