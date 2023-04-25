import { IsNotEmpty, Length, Matches } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';
import { AccountData } from '../../../entity/user.entity';
import { EMAIL_REGEX, LOGIN_REGEX } from '../../../common/constants/regexp';

export class CreateUserDto implements Omit<AccountData, 'createdAt' | 'banReason' | 'isBanned' | 'banDate'> {
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(3, 10, { message: 'The field must contain from 3 to 10 characters' })
  @Matches(LOGIN_REGEX, { message: 'Invalid login format' })
  public login: string;

  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(6, 20, { message: 'The field must contain from 6 to 20 characters' })
  public password: string;

  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Matches(EMAIL_REGEX, { message: 'Invalid email entered' })
  email: string;
}
