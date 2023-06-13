import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schema/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel('User') private user: Model<UserDocument>) {}

  findAll(): Promise<User[]> {
    return this.user.find().exec();
  }

  findOne(name: string) {
    return this.user.findOne({ name });
  }
}
