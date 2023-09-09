import { Module } from '@nestjs/common';
import { CommentsQueryRepository } from './repositories/mongoose/comments.query.repository';
import { CommentsWriteRepository } from './repositories/mongoose/comments.write.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentEntity } from '../../db/entities/mongoose/comment.entity';
import { FindCommentHandler } from './handlers/find-comment.handler';
import { SetLikeUnlikeForCommentHandler } from './handlers/set-like-unlike.handler';
import { DeleteOneCommentHandler } from './handlers/delete-one-comment.handler';
import { UpdateCommentHandler } from './handlers/update-comment.handler';
import { CqrsModule } from '@nestjs/cqrs';
import { Reaction, ReactionEntity } from '../../db/entities/mongoose/reaction.entity';
import { UsersQueryRepository } from '../Users/repositories/mongoose/users.query.repository';
import { ReactionsQueryRepository } from '../Reactions/repositories/mongoose/reactions.query.repository';
import { ReactionsWriteRepository } from '../Reactions/repositories/mongoose/reactions.write.repository';
import { User, UserEntity } from '../../db/entities/mongoose/user.entity';
import { BanUser, BanUserEntity } from '../../db/entities/mongoose/ban-user.entity';
import { BanUserQueryRepository } from '../BanUser/repositories/mongoose/ban-user.query.repository';
import { CommentsTypeOrmQueryRepository } from './repositories/typeorm/comments.query.repository';
import { CommentsTypeOrmWriteRepository } from './repositories/typeorm/comments.write.repository';
import { UsersTypeOrmQueryRepository } from '../Users/repositories/typeorm/users.query.repository';
import { BanUserTypeOrmQueryRepository } from '../BanUser/repositories/typeorm/ban-user.query.repository';
import { ReactionsTypeOrmQueryRepository } from '../Reactions/repositories/typeorm/reactions.query.repository';
import { ReactionsTypeOrmWriteRepository } from '../Reactions/repositories/typeorm/reactions.write.repository';

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
    CommentsTypeOrmQueryRepository,
    CommentsWriteRepository,
    CommentsTypeOrmWriteRepository,
    UsersQueryRepository,
    UsersTypeOrmQueryRepository,
    ReactionsQueryRepository,
    ReactionsTypeOrmQueryRepository,
    ReactionsWriteRepository,
    ReactionsTypeOrmWriteRepository,
    BanUserQueryRepository,
    BanUserTypeOrmQueryRepository,
    ...CommandHandlers,
  ],
})
export class CommentsModule {}
