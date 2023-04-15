import { IsEnum, IsNotEmpty } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';
import { LikeStatuses } from '../../common/interfaces';

export class MakeLikeUnlikeDto {
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsEnum(LikeStatuses, { message: 'Invalid status entered' })
  public likeStatus: LikeStatuses;
}
