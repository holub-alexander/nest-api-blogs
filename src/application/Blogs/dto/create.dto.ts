import { IsNotEmpty, Length, Matches } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';
import { Blog } from '../../../entity/blog.entity';
import { WEBSITE_URL } from '../../../common/constants/regexp';

export class CreateBlogDto implements Omit<Blog, '_id' | 'isMembership' | 'createdAt' | 'bloggerInfo' | 'banInfo'> {
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(1, 15)
  public name: string;

  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(1, 500)
  public description: string;

  @IsNotEmpty()
  @Length(1, 100)
  @Matches(WEBSITE_URL)
  public websiteUrl: string;
}
