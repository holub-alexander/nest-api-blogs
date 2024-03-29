import { IsOptional, Length } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';
import { PaginationOptionsDto } from '../../../common/dto/pagination-options.dto';

export class PaginationBlogDto extends PaginationOptionsDto {
  constructor() {
    super();
  }

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(1, 15)
  public readonly searchNameTerm?: string;
}
