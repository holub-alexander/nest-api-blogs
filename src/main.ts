import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from '@/common/filters/exaption.filter';

// const PORT = process.env.PORT || 5000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
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

  await app.listen(3000);
}
bootstrap();
