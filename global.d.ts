import { UserRefreshTokenPayload, UserPayload } from '@/auth/interfaces';

export {};

declare global {
  namespace Express {
    export interface Request {
      user: UserPayload;
      userRefreshTokenPayload: UserRefreshTokenPayload;
    }
  }
}
