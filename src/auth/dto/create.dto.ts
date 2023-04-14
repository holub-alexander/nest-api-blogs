import {
  IsNotEmpty,
  Length,
  Matches,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';
import { validateValueLength } from '../../common/utils/custom-validations';
import { EMAIL_REGEX } from '../../common/constants/regexp';
import {
  LoginInputModel,
  NewPasswordRecoveryInputModel,
  PasswordRecoveryInputModel,
  RegistrationConfirmationCodeModel,
  RegistrationEmailResending,
} from '../interfaces';

const createErrorMessage = (isValidValue: boolean, errorMessage: string, errors: string[]): void => {
  if (!isValidValue) {
    errors.push(errorMessage);
  }
};

@ValidatorConstraint({ name: 'customText', async: true })
export class ValidateLoginOrEmail implements ValidatorConstraintInterface {
  async validate(text: string, args: ValidationArguments): Promise<boolean> {
    const errors: string[] = [];
    const isEmail = text.includes('@');

    if (isEmail) {
      createErrorMessage(validateValueLength(text, 3, 200), 'The field must contain from 3 to 200 characters', errors);
      createErrorMessage(EMAIL_REGEX.test(text), 'Invalid email entered', errors);
    } else {
      createErrorMessage(validateValueLength(text, 3, 10), 'The field must contain from 3 to 10 characters', errors);
    }

    return errors.length === 0;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Blog with specified id was not found';
  }
}

export class PasswordRecoveryInputDto implements PasswordRecoveryInputModel {
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Matches(EMAIL_REGEX, { message: 'Invalid email entered' })
  email: string;
}

export class NewPasswordRecoveryInputDto implements NewPasswordRecoveryInputModel {
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(6, 20, { message: 'The field must contain from 6 to 20 characters' })
  newPassword: string;

  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  recoveryCode: string;
}

export class LoginInputDto implements LoginInputModel {
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Validate(ValidateLoginOrEmail)
  loginOrEmail: string;

  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(6, 20, { message: 'The field must contain from 6 to 20 characters' })
  password: string;
}

export class ConfirmRegistrationInputDto implements RegistrationConfirmationCodeModel {
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(5, 50, { message: 'The field must contain from 5 to 50 characters' })
  code: string;
}

export class RegistrationEmailResendingInputDto implements RegistrationEmailResending {
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Matches(EMAIL_REGEX, { message: 'Invalid email entered' })
  email: string;
}
