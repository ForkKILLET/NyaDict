import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: {
    updatedAt: 'accessTime',
    createdAt: 'createTime',
  },
})
export class Archive extends Document<string> {
  @Prop()
  owner: string;
  @Prop()
  title: string;
  @Prop()
  wordCount: number;
  @Prop()
  content: string;
  @Prop()
  size: number;
  @Prop()
  public: boolean;

  accessTime: Date;
  createTime: Date;
}
export type ArchiveT = Omit<Archive, 'accessTime' | 'createTime'> & {
  accessTime: number;
  createTime: number;
};

export const ArchiveSchema = SchemaFactory.createForClass(Archive);
