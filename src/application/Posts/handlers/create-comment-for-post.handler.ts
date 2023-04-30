import { CreateCommentForPostDto } from '../../Comments/dto/create.dto';
import { CommentViewModel } from '../../Comments/interfaces';
import { CommentMapper } from '../../../common/mappers/comment.mapper';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentDocument } from '../../../entity/comment.entity';
import { Model } from 'mongoose';
import { PostsQueryRepository } from '../repositories/posts.query.repository';
import { CommentsWriteRepository } from '../../Comments/repositories/comments.write.repository';
import { UsersQueryRepository } from '../../Users/repositories/users.query.repository';
import { CommandHandler } from '@nestjs/cqrs';

export class CreateCommentForPostCommand {
  constructor(public postId: string, public body: CreateCommentForPostDto, public login: string) {}
}

@CommandHandler(CreateCommentForPostCommand)
export class CreateCommentForPostHandler {
  constructor(
    @InjectModel(Comment.name) private readonly CommentModel: Model<CommentDocument>,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly commentsWriteRepository: CommentsWriteRepository,
  ) {}

  public async execute({ postId, body, login }: CreateCommentForPostCommand): Promise<CommentViewModel | null> {
    const findPost = await this.postsQueryRepository.findOne(postId);
    const user = await this.usersQueryRepository.findByLogin(login);

    if (!findPost || !user) {
      return null;
    }

    const newComment = new this.CommentModel<Comment>({
      content: body.content,
      commentatorInfo: { id: user._id, login, isBanned: false },
      createdAt: new Date().toISOString(),
      postId: findPost._id,
      blogId: findPost.blog.id,
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
      },
    });

    await this.commentsWriteRepository.save(newComment);

    return CommentMapper.mapCommentViewModel(newComment, null, 0, 0);
  }
}
