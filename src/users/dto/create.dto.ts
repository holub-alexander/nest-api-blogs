import { AccountData } from '@/entity/user.entity';
import { IsNotEmpty, Length, Matches } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';
import { EMAIL_REGEX, LOGIN_REGEX } from '@/common/constants/regexp';

export class CreateUserDto implements Omit<AccountData, 'createdAt'> {
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(3, 10)
  @Matches(LOGIN_REGEX)
  public login: string;

  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(6, 20)
  public password: string;

  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Matches(EMAIL_REGEX)
  email: string;
}
