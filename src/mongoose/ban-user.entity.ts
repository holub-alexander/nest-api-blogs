import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type BanUserDocument = HydratedDocument<BanUser>;

export class BanInfo {
  @Prop({ type: Boolean, required: true })
  isBanned: boolean;

  @Prop({ type: String, required: true, trim: true })
  banReason: string;

  @Prop({ type: Date, required: true })
  banDate: string;
}

export class User {
  @Prop({ required: true, type: Types.ObjectId })
  id: Types.ObjectId;

  @Prop({
    required: true,
    trim: true,
    type: String,
  })
  login: string;
}

@Schema()
export class BanUser {
  @Prop({ type: User, required: true })
  user: User;

  @Prop({ type: BanInfo, required: true })
  banInfo: BanInfo;

  @Prop({ type: Types.ObjectId, required: true })
  blogId: Types.ObjectId;
}

export const BanUserEntity = SchemaFactory.createForClass(BanUser);
