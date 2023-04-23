import { Module } from '@nestjs/common';
import { ReactionsQueryRepository } from './repositories/reactions.query.repository';
import { ReactionsWriteRepository } from './repositories/reactions.write.repository';
import { Reaction, ReactionEntity } from '../../entity/reaction.entity';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forFeature([{ name: Reaction.name, schema: ReactionEntity }])],
  controllers: [],
  providers: [ReactionsQueryRepository, ReactionsWriteRepository],
})
export class ReactionsModule {}
