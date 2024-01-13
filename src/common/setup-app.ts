import { BadRequestException, INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { HttpExceptionFilter } from './filters/exception.filter';

export const setupApp = (app: INestApplication) => {
  app.enableCors();
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        const errorsForResponse: { field: string }[] = [];

        errors.forEach((e) => {
          const constraintsKeys = Object.keys(e.constraints as any);
          constraintsKeys.forEach((key) => {
            // @ts-ignore
            errorsForResponse.push({ message: e.constraints[key], field: e.property });
          });
        });

        throw new BadRequestException(errorsForResponse);
      },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
};
