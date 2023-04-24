import { Module } from '@nestjs/common';
import { ReactionsQueryRepository } from './repositories/reactions.query.repository';
import { ReactionsWriteRepository } from './repositories/reactions.write.repository';
import { Reaction, ReactionEntity } from '../../entity/reaction.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { FindAllLikesHandler } from './handlers/find-all-likes.handler';

export const commandHandlers = [FindAllLikesHandler];

@Module({
  imports: [MongooseModule.forFeature([{ name: Reaction.name, schema: ReactionEntity }])],
  controllers: [],
  providers: [ReactionsQueryRepository, ReactionsWriteRepository, ...commandHandlers],
})
export class ReactionsModule {}
