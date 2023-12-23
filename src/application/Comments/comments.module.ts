import { Module } from '@nestjs/common';
import { FindCommentHandler } from './handlers/find-comment.handler';
import { SetLikeUnlikeForCommentHandler } from './handlers/set-like-unlike.handler';
import { DeleteOneCommentHandler } from './handlers/delete-one-comment.handler';
import { UpdateCommentHandler } from './handlers/update-comment.handler';
import { CqrsModule } from '@nestjs/cqrs';
import { CommentsQueryRepository } from './repositories/comments.query.repository';
import { CommentsWriteRepository } from './repositories/comments.write.repository';
import { UsersQueryRepository } from '../Users/repositories/users.query.repository';
import { ReactionsQueryRepository } from '../Reactions/repositories/reactions.query.repository';
import { ReactionsWriteRepository } from '../Reactions/repositories/reactions.write.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import UserEntity from '../../db/entities/user.entity';
import CommentEntity from '../../db/entities/comment.entity';
import ReactionEntity from '../../db/entities/reaction.entity';

export const CommandHandlers = [
  FindCommentHandler,
  SetLikeUnlikeForCommentHandler,
  DeleteOneCommentHandler,
  UpdateCommentHandler,
];

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([UserEntity, CommentEntity, ReactionEntity])],
  controllers: [],
  providers: [
    CommentsQueryRepository,
    CommentsWriteRepository,
    UsersQueryRepository,
    ReactionsQueryRepository,
    ReactionsWriteRepository,
    ...CommandHandlers,
  ],
})
export class CommentsModule {}
