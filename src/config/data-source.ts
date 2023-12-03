import { registerAs } from '@nestjs/config';
import { config as dotenvConfig } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import type { SeederOptions } from 'typeorm-extension';
import invariant from 'tiny-invariant';
import BlogEntity from '../db/entities/typeorm/blog.entity';
import PostEntity from '../db/entities/typeorm/post.entity';
import CommentEntity from '../db/entities/typeorm/comment.entity';
import ReactionEntity from '../db/entities/typeorm/reaction.entity';
import UserEntity from '../db/entities/typeorm/user.entity';
import DeviceEntity from '../db/entities/typeorm/device.entity';
import { BlogFactory } from '../db/seeding/factories/blog.factory';
import { MainSeeder } from '../db/seeding/seeders/main.seeder';
import BannedUserInBlogEntity from '../db/entities/typeorm/banned-user-in-blog.entity';

dotenvConfig({ path: 'env/.env' });

const type: DataSourceOptions['type'] = 'postgres';

const entities = [
  BlogEntity,
  PostEntity,
  ReactionEntity,
  CommentEntity,
  UserEntity,
  DeviceEntity,
  BannedUserInBlogEntity,
];

const dataSourceOptions: DataSourceOptions & SeederOptions = {
  type,
  host: process.env.PG_HOST,
  username: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  ssl: true,
  migrations: ['dist/db/migrations/*{.ts,.js}'],
  entities,
  factories: [BlogFactory],
  seeds: [MainSeeder],
};

export const dataSource = registerAs('data-source', () => {
  console.log('process', process.env.NODE_ENV, process.env.PG_DATABASE, process.env.DB_HOST);

  if (process.env.NODE_ENV === 'test') {
    console.log('config :>> test config');

    return {
      type,
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      ssl: false,
      migrationsRun: true,
      migrations: ['src/db/migrations/*{.ts,.js}'],
      entities,
      factories: [BlogFactory],
      seeds: [MainSeeder],
    } as DataSourceOptions & SeederOptions;
  }

  invariant(process.env.PG_DATABASE, 'DATABASE_URL is missing');

  return {
    ...dataSourceOptions,
    type,
    synchronize: false,
    autoLoadEntities: true,
  } as TypeOrmModuleOptions;
});

export default new DataSource(dataSourceOptions);
