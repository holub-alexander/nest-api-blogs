import { CreateCommentForPostDto } from '../../Comments/dto/create.dto';
import { CommentViewModel } from '../../Comments/interfaces';
import { CommentMapper } from '../../Comments/mappers/comment.mapper';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentDocument } from '../../../db/entities/mongoose/comment.entity';
import { Model } from 'mongoose';
import { CommandHandler } from '@nestjs/cqrs';
import { ForbiddenException } from '@nestjs/common';
import { PostsTypeOrmQueryRepository } from '../repositories/typeorm/posts.query.repository';
import { UsersTypeOrmQueryRepository } from '../../Users/repositories/typeorm/users.query.repository';
import { BanUserTypeOrmQueryRepository } from '../../BanUser/repositories/typeorm/ban-user.query.repository';
import { CommentsTypeOrmWriteRepository } from '../../Comments/repositories/typeorm/comments.write.repository';
import CommentEntityTypeOrm from '../../../db/entities/typeorm/comment.entity';

export class CreateCommentForPostCommand {
  constructor(public postId: string, public body: CreateCommentForPostDto, public login: string) {}
}

@CommandHandler(CreateCommentForPostCommand)
export class CreateCommentForPostHandler {
  constructor(
    @InjectModel(Comment.name) private readonly CommentModel: Model<CommentDocument>,
    private readonly postsQueryRepository: PostsTypeOrmQueryRepository,
    private readonly usersQueryRepository: UsersTypeOrmQueryRepository,
    private readonly commentsWriteRepository: CommentsTypeOrmWriteRepository,
    private readonly banUserQueryRepository: BanUserTypeOrmQueryRepository,
  ) {}

  public async execute({ postId, body, login }: CreateCommentForPostCommand): Promise<CommentViewModel | null> {
    const foundPost = await this.postsQueryRepository.findOne(postId);
    const user = await this.usersQueryRepository.findByLogin(login);

    if (!foundPost || foundPost.length === 0 || !user) {
      return null;
    }

    const bannedUserFound = await this.banUserQueryRepository.findBanedUserForBlog(user.id, foundPost[0].blog_id);

    if (bannedUserFound.length > 0) {
      throw new ForbiddenException();
    }

    const newComment = new CommentEntityTypeOrm();

    newComment.user_id = user.id;
    newComment.blog_id = foundPost[0].blog_id;
    newComment.post_id = foundPost[0].id;
    newComment.created_at = new Date();
    newComment.content = body.content;

    const res = await this.commentsWriteRepository.create(newComment);

    return res ? CommentMapper.mapCommentViewModel(res, null, 0, 0) : null;
  }
}
