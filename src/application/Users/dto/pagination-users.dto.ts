import { IsOptional, Length, Matches } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';
import { PaginationOptionsDto } from '../../../common/dto/pagination-options.dto';
import { LOGIN_REGEX } from '../../../common/constants/regexp';

export class PaginationUsersDto extends PaginationOptionsDto {
  constructor() {
    super();
  }

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(3, 20)
  @Matches(LOGIN_REGEX)
  public readonly searchLoginTerm?: string;

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(3, 200)
  public readonly searchEmailTerm?: string;
}
