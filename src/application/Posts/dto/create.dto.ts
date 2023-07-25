import {
  IsNotEmpty,
  Length,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';
import { Injectable } from '@nestjs/common';
import { Post } from '../../../db/entities/mongoose/post.entity';
import { CommandBus } from '@nestjs/cqrs';
import { FindOneBlogCommand } from '../../Blogs/handlers/find-one-blog.handler';

type CreatePost = Omit<Post, '_id' | 'blog' | 'createdAt' | 'likesInfo' | 'userInfo' | 'isBanned'>;

@ValidatorConstraint({ name: 'customText', async: true })
@Injectable()
export class IsBlogFound implements ValidatorConstraintInterface {
  constructor(private commandBus: CommandBus) {}

  async validate(text: string, args: ValidationArguments): Promise<boolean> {
    if (!text) {
      return true;
    }

    const findBlog = await this.commandBus.execute(new FindOneBlogCommand(text));

    return Boolean(findBlog);
  }

  defaultMessage(args: ValidationArguments) {
    return 'Blog with specified id was not found';
  }
}

export class CreatePostDto implements CreatePost {
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

export class CreatePostFromBlog implements CreatePost {
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
