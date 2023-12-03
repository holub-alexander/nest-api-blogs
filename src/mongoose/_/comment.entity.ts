import { HydratedDocument, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type CommentDocument = HydratedDocument<Comment>;

export class CommentatorInfo {
  @Prop({ required: true, type: Types.ObjectId })
  id: Types.ObjectId;

  @Prop({ required: true, type: String })
  login: string;

  @Prop({ required: true, type: Boolean, default: false })
  isBanned: boolean;
}

export class LikesInfo {
  @Prop({ required: true, type: Number, default: 0 })
  likesCount: number;

  @Prop({ required: true, type: Number, default: 0 })
  dislikesCount: number;
}

@Schema()
export class Comment {
  @Prop({
    required: true,
    trim: true,
    type: String,
  })
  content: string;

  @Prop({ required: true, schema: CommentatorInfo })
  commentatorInfo: CommentatorInfo;

  @Prop({ required: true, type: Types.ObjectId })
  blogId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  postId: Types.ObjectId;

  @Prop({ required: true, type: Date, default: new Date().toISOString })
  createdAt: string;

  @Prop({
    type: Boolean,
    default: false,
  })
  isBanned: boolean;

  @Prop({ required: true, schema: LikesInfo })
  likesInfo: LikesInfo;
}

export const CommentEntity = SchemaFactory.createForClass(Comment);
