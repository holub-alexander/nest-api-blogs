import {
  IsNotEmpty,
  Length,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { FindOneBlogCommand } from '../../Blogs/handlers/blogs/find-one-blog.handler';
import { Transform, TransformFnParams } from 'class-transformer';

@ValidatorConstraint({ name: 'customText', async: true })
@Injectable()
export class FindBlogParamValidator implements ValidatorConstraintInterface {
  constructor(private readonly commandBus: CommandBus) {}

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

export class BindUserToBlogParamsDto {
  @IsNotEmpty()
  @Length(1, 30)
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Validate(FindBlogParamValidator)
  public id: string;

  @IsNotEmpty()
  @Length(1, 30)
  public userId: string;
}
