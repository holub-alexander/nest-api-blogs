import { Transform, TransformFnParams, Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class PaginationTopUsersDto {
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
  @Transform(({ value }: TransformFnParams) => {
    if (typeof value === 'string') {
      const sortParams = value.split('&');

      return sortParams.map((param) => {
        const [fieldName, direction] = param.split(' ');

        return `${fieldName} ${direction || 'asc'}`;
      });
    }

    return value;
  })
  public readonly sort: string[];
}
