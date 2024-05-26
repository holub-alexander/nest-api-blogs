import { registerAs } from '@nestjs/config';
import { config as dotenvConfig } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import type { SeederOptions } from 'typeorm-extension';
import invariant from 'tiny-invariant';
import BlogEntity from '../db/entities/blog.entity';
import PostEntity from '../db/entities/post.entity';
import CommentEntity from '../db/entities/comment.entity';
import ReactionEntity from '../db/entities/reaction.entity';
import UserEntity from '../db/entities/user.entity';
import DeviceEntity from '../db/entities/device.entity';
import { BlogFactory } from '../db/seeding/factories/blog.factory';
import { MainSeeder } from '../db/seeding/seeders/main.seeder';
import BannedUserInBlogEntity from '../db/entities/banned-user-in-blog.entity';
import { UserFactory } from '../db/seeding/factories/user.factory';
import { DeviceFactory } from '../db/seeding/factories/device.factory';
import { PostFactory } from '../db/seeding/factories/post.factory';
import { CommentFactory } from '../db/seeding/factories/comment.factory';
import { ReactionFactory } from '../db/seeding/factories/reaction.factory';
import PairQuizGameEntity from '../db/entities/quiz-game/pair-quiz-game.entity';
import PairQuizGameQuestionEntity from '../db/entities/quiz-game/pair-quiz-game-question.entity';
import PairQuizPlayerAnswerEntity from '../db/entities/quiz-game/pair-quiz-player-answer.entity';
import PairQuizPlayerProgressEntity from '../db/entities/quiz-game/pair-quiz-player-progress.entity';
import QuizQuestionEntity from '../db/entities/quiz-game/quiz-question.entity';
import { QuizQuestionFactory } from '../db/seeding/factories/quiz-game/quiz-question.factory';
import { PairQuizSeeder } from '../db/seeding/seeders/pair-quiz.seeder';
import BlogWallpapersEntity from '../db/entities/blog-wallpapers.entity';
import BlogMainImagesEntity from '../db/entities/blog-main-images.entity';
import PostMainImagesEntity from '../db/entities/post-main-images.entity';

dotenvConfig({ path: 'env/.env' });

const type: DataSourceOptions['type'] = 'postgres';

const entities = [
  BlogEntity,
  PostEntity,
  ReactionEntity,
  CommentEntity,
  PairQuizPlayerProgressEntity,
  UserEntity,
  DeviceEntity,
  BannedUserInBlogEntity,
  PairQuizGameEntity,
  PairQuizGameQuestionEntity,
  PairQuizPlayerAnswerEntity,
  QuizQuestionEntity,
  BlogWallpapersEntity,
  BlogMainImagesEntity,
  PostMainImagesEntity,
];

const factories = [
  BlogFactory,
  UserFactory,
  DeviceFactory,
  PostFactory,
  CommentFactory,
  ReactionFactory,
  QuizQuestionFactory,
];

const seeders = [MainSeeder, PairQuizSeeder];

const dataSourceOptions: DataSourceOptions & SeederOptions = {
  type,
  host: process.env.PG_HOST,
  username: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  ssl: true,
  migrations: ['dist/db/migrations/*{.ts,.js}'],
  entities,
  factories: factories,
  seeds: seeders,
};

export const dataSource = registerAs('data-source', () => {
  if (process.env.NODE_ENV === 'test') {
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
      factories: factories,
      seeds: seeders,
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
