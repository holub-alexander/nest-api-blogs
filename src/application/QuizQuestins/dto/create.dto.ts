import { QuizQuestionInputModel } from '../interfaces';
import {
  IsArray,
  IsNotEmpty,
  Length,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';

@ValidatorConstraint({ name: 'isValidCorrectAnswersArray', async: false })
class IsValidCorrectAnswersArrayConstraint implements ValidatorConstraintInterface {
  validate(value: any, validationArguments?: ValidationArguments): boolean {
    if (value === null) {
      return true;
    }

    if (!Array.isArray(value) || value.length === 0) {
      return false;
    }

    return value.every((item) => typeof item === 'string' || typeof item === 'number');
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return `correctAnswers must contain either both numbers and strings, only numbers, or only strings.`;
  }
}

export function IsValidCorrectAnswersArray(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidCorrectAnswersArrayConstraint,
    });
  };
}

export class CreateQuizQuestionDto implements QuizQuestionInputModel {
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(10, 500)
  public body: string;

  @IsArray()
  @IsValidCorrectAnswersArray()
  correctAnswers: (string | number)[];
}
