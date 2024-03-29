import { IsBoolean, IsNotEmpty, Length } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';

export class BanUnbanUserDto {
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => ({ true: true, false: false }[value as 'true' | 'false']))
  @IsBoolean()
  public isBanned: boolean;

  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(20, 1000, { message: 'The field must contain from 20 to 1000 characters' })
  public banReason: string;
}
