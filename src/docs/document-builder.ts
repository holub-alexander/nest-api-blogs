import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export const documentBuilder = (app: INestApplication) => {
  const config = new DocumentBuilder()
    .setTitle('Blogs API')
    .setDescription('API Description')
    .setVersion('1.0')
    .addTag('blogs')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);
};
