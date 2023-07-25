import { Module } from '@nestjs/common';
import { CommentsQueryRepository } from './repositories/comments.query.repository';
import { CommentsWriteRepository } from './repositories/comments.write.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentEntity } from '../../db/entities/mongoose/comment.entity';
import { FindCommentHandler } from './handlers/find-comment.handler';
import { SetLikeUnlikeForCommentHandler } from './handlers/set-like-unlike.handler';
import { DeleteOneCommentHandler } from './handlers/delete-one-comment.handler';
import { UpdateCommentHandler } from './handlers/update-comment.handler';
import { CqrsModule } from '@nestjs/cqrs';
import { Reaction, ReactionEntity } from '../../db/entities/mongoose/reaction.entity';
import { UsersQueryRepository } from '../Users/repositories/mongoose/users.query.repository';
import { ReactionsQueryRepository } from '../Reactions/repositories/reactions.query.repository';
import { ReactionsWriteRepository } from '../Reactions/repositories/reactions.write.repository';
import { User, UserEntity } from '../../db/entities/mongoose/user.entity';
import { BanUser, BanUserEntity } from '../../db/entities/mongoose/ban-user.entity';
import { BanUserQueryRepository } from '../BanUser/repositories/ban-user.query.repository';

export const CommandHandlers = [
  FindCommentHandler,
  SetLikeUnlikeForCommentHandler,
  DeleteOneCommentHandler,
  UpdateCommentHandler,
];

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserEntity },
      { name: Comment.name, schema: CommentEntity },
      { name: Reaction.name, schema: ReactionEntity },
      { name: BanUser.name, schema: BanUserEntity },
    ]),
  ],
  controllers: [],
  providers: [
    CommentsQueryRepository,
    CommentsWriteRepository,
    UsersQueryRepository,
    ReactionsQueryRepository,
    ReactionsWriteRepository,
    BanUserQueryRepository,
    ...CommandHandlers,
  ],
})
export class CommentsModule {}
