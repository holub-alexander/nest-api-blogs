import { BanUnbanUserDto } from '../../Users/dto/ban-unban.dto';
import { IsNotEmpty, Length } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';

export class BanUserForBlogDto extends BanUnbanUserDto {
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(6, 100)
  blogId: string;
}
