import { HydratedDocument, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type PostDocument = HydratedDocument<Post>;

export class PostBlog {
  @Prop({ required: true, type: Types.ObjectId })
  id: Types.ObjectId;

  @Prop({
    required: true,
    trim: true,
    type: String,
  })
  name: string;
}

@Schema()
export class Post {
  _id: Types.ObjectId;

  @Prop({
    required: true,
    trim: true,
    type: String,
    min: 1,
    max: 30,
  })
  title: string;

  @Prop({
    required: true,
    trim: true,
    type: String,
    min: 1,
    max: 100,
  })
  shortDescription: string;

  @Prop({
    required: true,
    trim: true,
    type: String,
    min: 1,
    max: 1000,
  })
  content: string;

  @Prop({ required: true, schema: PostBlog })
  blog: PostBlog;

  @Prop({ required: true, type: Date })
  createdAt: Date;
}

export const PostEntity = SchemaFactory.createForClass(Post);
