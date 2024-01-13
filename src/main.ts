import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { useContainer } from 'class-validator';

import { documentBuilder } from './docs/document-builder';
import { setupApp } from './common/setup-app';

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  setupApp(app);

  documentBuilder(app);

  await app.listen(PORT);
}

bootstrap();
