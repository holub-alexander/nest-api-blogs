import { HydratedDocument, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type PostDocument = HydratedDocument<Post>;

export class LikesInfo {
  @Prop({ required: true, type: Number, default: 0 })
  likesCount: number;

  @Prop({ required: true, type: Number, default: 0 })
  dislikesCount: number;
}

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

export class UserInfo {
  @Prop({ required: true, type: Types.ObjectId })
  id: any;

  @Prop({ required: true, type: Boolean, default: false })
  isBanned: boolean;
}

@Schema()
export class Post {
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

  @Prop({
    type: Boolean,
    default: false,
  })
  isBanned: boolean;

  @Prop({ required: true, schema: LikesInfo })
  likesInfo: LikesInfo;

  @Prop({ required: true, schema: UserInfo })
  userInfo: UserInfo;
}

export const PostEntity = SchemaFactory.createForClass(Post);
