import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export class AccountData {
  @Prop({ required: true, type: String })
  login: string;

  @Prop({ required: true, type: String })
  password: string;

  @Prop({ required: true, type: String })
  email: string;

  @Prop({ required: true, type: Date })
  createdAt: string;
}

@Schema()
export class User {
  _id: Types.ObjectId;

  @Prop({ required: true, schema: AccountData })
  accountData: AccountData;
}

export const UserSchema = SchemaFactory.createForClass(User);
