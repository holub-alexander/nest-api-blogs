import { Injectable } from '@nestjs/common';
import { UpdateCommentForPostDto } from '../dto/update.dto';
import CommentEntity from '../../../db/entities/typeorm/comment.entity';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import PostEntity from '../../../db/entities/typeorm/post.entity';

@Injectable()
export class CommentsWriteRepository {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(CommentEntity) private readonly commentRepository: Repository<CommentEntity>,
  ) {}

  public async create() {
    return this.commentRepository.create();
  }

  public async save(createdComment: CommentEntity): Promise<CommentEntity | null> {
    // const result = await this.dataSource.query(
    //   `
    //   WITH inserted_comment AS (
    //     INSERT INTO comments (
    //         user_id,
    //         blog_id,
    //         post_id,
    //         created_at,
    //         content
    //     )
    //     VALUES ($1, $2, $3, $4, $5)
    //     RETURNING *
    //   )
    //   SELECT inserted_comment.*, users.login AS user_login FROM inserted_comment
    //   JOIN users ON users.id = inserted_comment.user_id;
    // `,
    //   [
    //     createdComment.user_id,
    //     createdComment.blog_id,
    //     createdComment.post_id,
    //     createdComment.created_at,
    //     createdComment.content,
    //   ],
    // );
    //
    // return result[0] || null;

    console.log('savedC', createdComment);

    const savedComment = await this.commentRepository.save(createdComment);

    console.log('savedC', savedComment);

    return this.commentRepository.findOne({ where: { id: savedComment.id }, relations: ['user'] });
  }

  public async deleteById(id: number, userId: number): Promise<boolean> {
    // const result = await this.dataSource.query<[CommentEntity, number]>(
    //   `
    //   DELETE FROM comments
    //   WHERE id = $1
    // `,
    //   [id],
    // );
    //
    // return result[1] > 0;

    const res = await this.commentRepository.delete({ id });

    return !res.affected ? false : res.affected > 0;
  }

  public async updateById(commentId: string, body: UpdateCommentForPostDto): Promise<boolean> {
    if (!commentId || !Number.isInteger(+commentId)) {
      return false;
    }

    // const result = await this.dataSource.query<[CommentEntity[], number]>(
    //   `
    //     UPDATE comments
    //     SET content = $2
    //     WHERE id = $1
    //     RETURNING *;
    // `,
    //   [commentId, body.content],
    // );
    //
    // return result[1] > 0;

    const res = await this.commentRepository.update({ id: +commentId }, { content: body.content });

    return !res.affected ? false : res.affected > 0;
  }

  public async deleteMany(): Promise<boolean> {
    //   const result = await this.dataSource.query(`
    //     DELETE FROM comments
    //     WHERE id > 0;
    //   `);
    //
    //   return result[1] > 0;
    // }

    const res = await this.commentRepository.delete({});

    return !res.affected ? false : res.affected > 0;
  }
}
