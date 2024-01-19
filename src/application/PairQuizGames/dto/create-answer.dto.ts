import { IsNotEmpty, Length } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';

export class CreateAnswerDto {
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(1, 500)
  public answer: string;
}
