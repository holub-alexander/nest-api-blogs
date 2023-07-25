import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { CommentatorInfo } from './comment.entity';
import { LikeStatuses } from '../../../../common/interfaces';

export type ReactionDocument = HydratedDocument<Reaction>;

@Schema()
export class Reaction {
  @Prop({ type: String, required: true })
  type: string;

  @Prop({ type: Types.ObjectId, required: true })
  subjectId: Types.ObjectId;

  @Prop({ required: true, schema: CommentatorInfo })
  user: CommentatorInfo;

  @Prop({ type: Date, default: new Date().toISOString })
  createdAt: Date | string;

  @Prop({ type: String, required: true })
  likeStatus: LikeStatuses;
}

export const ReactionEntity = SchemaFactory.createForClass(Reaction);
