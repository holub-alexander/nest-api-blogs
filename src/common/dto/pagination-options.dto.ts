import { IsEnum, IsInt, IsOptional, Length, Min } from 'class-validator';
import { SortDirections } from '@/common/interfaces';
import { Transform, TransformFnParams, Type } from 'class-transformer';

export class PaginationOptionsDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  public readonly pageNumber: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  public readonly pageSize: number = 10;

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(1, 50)
  public readonly sortBy: string = 'createdAt';

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsEnum(SortDirections)
  public readonly sortDirection: SortDirections = SortDirections.DESC;
}
