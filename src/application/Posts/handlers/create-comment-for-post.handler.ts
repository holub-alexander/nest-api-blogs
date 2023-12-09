import { CreateCommentForPostDto } from '../../Comments/dto/create.dto';
import { CommentViewModel } from '../../Comments/interfaces';
import { CommentMapper } from '../../Comments/mappers/comment.mapper';
import { CommandHandler } from '@nestjs/cqrs';
import { PostsQueryRepository } from '../repositories/posts.query.repository';
import { UsersQueryRepository } from '../../Users/repositories/users.query.repository';
import { CommentsWriteRepository } from '../../Comments/repositories/comments.write.repository';

export class CreateCommentForPostCommand {
  constructor(public postId: string, public body: CreateCommentForPostDto, public login: string) {}
}

@CommandHandler(CreateCommentForPostCommand)
export class CreateCommentForPostHandler {
  constructor(
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly commentsWriteRepository: CommentsWriteRepository,
  ) {}

  public async execute({ postId, body, login }: CreateCommentForPostCommand): Promise<CommentViewModel | null> {
    const foundPost = await this.postsQueryRepository.findOne(postId);
    const user = await this.usersQueryRepository.findByLogin(login);

    if (!foundPost || !user) {
      return null;
    }

    const newComment = await this.commentsWriteRepository.create();

    newComment.user_id = user.id;
    newComment.blog_id = foundPost.blog_id;
    newComment.post_id = foundPost.id;
    newComment.created_at = new Date();
    newComment.content = body.content;

    const res = await this.commentsWriteRepository.save(newComment);

    return res ? CommentMapper.mapCommentViewModel(res, null, 0, 0) : null;
  }
}
