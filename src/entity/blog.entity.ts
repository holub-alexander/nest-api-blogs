import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { WEBSITE_URL } from '../common/constants/regexp';

export type BlogDocument = HydratedDocument<Blog>;

@Schema()
export class Blog {
  _id: Types.ObjectId;

  @Prop({
    required: true,
    type: String,
    trim: true,
  })
  name: string;

  @Prop({
    required: true,
    type: String,
    trim: true,
  })
  description: string;

  @Prop({
    required: true,
    type: String,
    trim: true,
    regexp: WEBSITE_URL,
  })
  websiteUrl: string;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({
    type: Boolean,
    default: false,
  })
  isMembership: boolean;
}

export const BlogEntity = SchemaFactory.createForClass(Blog);
