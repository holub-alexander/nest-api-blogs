import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { CqrsModule } from '@nestjs/cqrs';
import { PublicModule } from './application/Public/public.module';
import { SuperAdminModule } from './application/Super-Admin/super-admin.module';
import { APP_GUARD } from '@nestjs/core';
import { BloggerModule } from './application/Blogger/blogger.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import typeorm from './config/typeorm';

@Module({
  imports: [
    CqrsModule,
    ConfigModule.forRoot({ envFilePath: 'env/.env', isGlobal: true, load: [typeorm] }),

    ThrottlerModule.forRoot({
      ttl: 10,
      limit: 5,
    }),

    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        transport: {
          service: 'gmail',
          auth: {
            user: config.get('ADMIN_EMAIL'),
            pass: config.get('GMAIL_APP_PASSWORD'),
          },
        },
        defaults: {
          from: `Alexander <${config.get('ADMIN_EMAIL')}>`,
        },
        template: {
          dir: join(__dirname, './templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),

    MongooseModule.forRoot(
      `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.c1xap4q.mongodb.net/${process.env.MONGODB_DATABASE_NAME}?retryWrites=true&w=majority`,
    ),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      // @ts-ignore
      useFactory: async (configService: ConfigService) => configService.get('typeorm'),
    }),

    JwtModule.register({
      global: true,
      signOptions: { expiresIn: '10m' },
    }),

    BloggerModule,
    PublicModule,
    SuperAdminModule,
  ],
  controllers: [],
  // providers: [
  //   {
  //     provide: APP_GUARD,
  //     useClass: ThrottlerGuard,
  //   },
  // ],
})
export class AppModule {}
