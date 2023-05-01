import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { WEBSITE_URL } from '../common/constants/regexp';

export type BlogDocument = HydratedDocument<Blog>;

export class BloggerInfo {
  @Prop({
    type: String,
    required: true,
  })
  login: string;

  @Prop({ required: true, type: Types.ObjectId })
  id: Types.ObjectId;

  @Prop({ type: Boolean, default: false })
  isBanned: boolean;
}

@Schema()
export class Blog {
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

  @Prop({ type: Date, default: new Date().toISOString })
  createdAt: Date;

  @Prop({
    type: Boolean,
    default: false,
  })
  isMembership: boolean;

  @Prop({
    type: Boolean,
    default: false,
  })
  isBanned: boolean;

  @Prop({
    schema: BloggerInfo,
  })
  bloggerInfo: BloggerInfo;
}

export const BlogEntity = SchemaFactory.createForClass(Blog);
