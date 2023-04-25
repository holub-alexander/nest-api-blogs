import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;
export type RefreshTokensMetaDocument = HydratedDocument<RefreshTokensMeta>;

export class AccountData {
  @Prop({ required: true, type: String })
  login: string;

  @Prop({ required: true, type: String })
  password: string;

  @Prop({ required: true, type: String })
  email: string;

  @Prop({ required: true, type: Date })
  createdAt: string;

  @Prop({ type: Boolean, default: false })
  isBanned: boolean;

  @Prop({ type: String, default: null })
  banReason: string | null;

  @Prop({ type: Date, default: null })
  banDate: string | null;
}

export class EmailConfirmation {
  @Prop({ type: String, default: null })
  confirmationCode: string | null;

  @Prop({ type: Date, default: null })
  expirationDate: Date | null;

  @Prop({ type: Boolean, required: true })
  isConfirmed: boolean;
}

export class PasswordRecovery {
  @Prop({ type: String, default: null })
  recoveryCode: string | null;
}

@Schema()
export class RefreshTokensMeta {
  @Prop({ type: String, required: true })
  ip: string;

  @Prop({ type: String, default: null })
  title: string;

  @Prop({ type: String, required: true })
  deviceId: string;

  @Prop({ type: Date, required: true })
  issuedAt: Date;

  @Prop({ type: Date, required: true })
  expirationDate: Date;
}

@Schema()
export class User {
  @Prop({ required: true, schema: AccountData })
  accountData: AccountData;

  @Prop({ required: true, schema: EmailConfirmation })
  emailConfirmation: EmailConfirmation;

  @Prop({ required: true, schema: PasswordRecovery })
  passwordRecovery: PasswordRecovery;

  @Prop({ type: Array, schema: [RefreshTokensMeta] })
  refreshTokensMeta: RefreshTokensMeta[] | [];
}

export const UserEntity = SchemaFactory.createForClass(User);
export const RefreshTokenEntity = SchemaFactory.createForClass(RefreshTokensMeta);
