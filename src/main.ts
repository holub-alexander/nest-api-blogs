import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from '@/common/filters/exception.filter';
import { useContainer } from 'class-validator';
import cookieParser from 'cookie-parser';

// const PORT = process.env.PORT || 5000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

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

        console.log(errorsForResponse);

        throw new BadRequestException(errorsForResponse);
      },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(3000);
}

bootstrap();
