import { IsEnum, IsOptional, Length } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';
import { PaginationOptionsDto } from '../../../common/dto/pagination-options.dto';
import { PublishedStatuses } from '../../../common/interfaces';

export class PaginationQuizQuestionsDto extends PaginationOptionsDto {
  constructor() {
    super();
  }

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(10, 500)
  public readonly bodySearchTerm?: string;

  @IsOptional()
  @IsEnum(PublishedStatuses)
  public publishedStatus?: PublishedStatuses = PublishedStatuses.All;
}
