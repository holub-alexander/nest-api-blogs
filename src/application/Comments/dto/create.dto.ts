import { Comment } from '../../../mongoose/comment.entity';
import { IsNotEmpty, Length } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';

export class CreateCommentForPostDto implements Pick<Comment, 'content'> {
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(20, 200, { message: 'The field must contain from 20 to 300 characters' })
  public content: string;
}
