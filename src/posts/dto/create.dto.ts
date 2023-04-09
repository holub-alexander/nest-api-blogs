import { Post } from '@/entity/post.entity';
import {
  IsNotEmpty,
  Length,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';
import { Injectable } from '@nestjs/common';
import { BlogsService } from '@/blogs/blogs.service';

@ValidatorConstraint({ name: 'customText', async: true })
@Injectable()
export class IsBlogFound implements ValidatorConstraintInterface {
  constructor(private readonly blogsService: BlogsService) {}

  async validate(text: string, args: ValidationArguments): Promise<boolean> {
    if (!text) {
      return true;
    }

    const findBlog = await this.blogsService.findOne(text);

    return Boolean(findBlog);
  }

  defaultMessage(args: ValidationArguments) {
    return 'Blog with specified id was not found';
  }
}

export class CreatePostDto implements Omit<Post, '_id' | 'blog' | 'createdAt'> {
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(1, 30)
  public title: string;

  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(1, 100)
  public shortDescription: string;

  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(1, 1000)
  public content: string;

  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(1, 30)
  @Validate(IsBlogFound)
  public blogId: string;
}

export class CreatePostFromBlog implements Omit<Post, '_id' | 'blog' | 'createdAt'> {
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(1, 30)
  public title: string;

  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(1, 100)
  public shortDescription: string;

  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(1, 1000)
  public content: string;
}
