import { WithId } from 'mongodb';

export type UserAccountDBType = WithId<{
  accountData: { login: string; password: string; email: string; createdAt: Date | string };
}>;
