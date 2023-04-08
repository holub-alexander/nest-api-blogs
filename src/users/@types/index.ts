import { Length, Matches } from 'class-validator';
import { EMAIL_REGEX, LOGIN_REGEX } from '../../common/constants/regexp';

export class UserInputModel {
  @Length(3, 10)
  @Matches(LOGIN_REGEX)
  login: string;
  @Length(6, 20)
  password: string;
  @Length(1)
  @Matches(EMAIL_REGEX)
  email: string;
}

export type UserViewModel = Omit<UserInputModel, 'password'> & {
  id: string;
  createdAt: string;
};
