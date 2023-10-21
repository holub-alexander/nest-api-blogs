import { Injectable } from '@nestjs/common';
import { UpdateCommentForPostDto } from '../../dto/update.dto';
import CommentEntityTypeOrm from '../../../../db/entities/typeorm/comment.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class CommentsTypeOrmWriteRepository {
  constructor(private readonly dataSource: DataSource) {}

  public async create(createdComment: CommentEntityTypeOrm): Promise<CommentEntityTypeOrm | null> {
    const result = await this.dataSource.query(
      `
      WITH inserted_comment AS (
        INSERT INTO comments (
            user_id,
            blog_id,
            post_id,
            created_at,
            content
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      )
      SELECT inserted_comment.*, users.login AS user_login FROM inserted_comment
      JOIN users ON users.id = inserted_comment.user_id;
    `,
      [
        createdComment.user_id,
        createdComment.blog_id,
        createdComment.post_id,
        createdComment.created_at,
        createdComment.content,
      ],
    );

    return result[0] || null;
  }

  public async deleteById(id: number, userId: number): Promise<boolean> {
    // const isValidId = ObjectId.isValid(id);
    //
    // if (!isValidId) {
    //   return false;
    // }
    //
    // const res = await this.CommentModel.deleteOne({ _id: new ObjectId(id) });
    // return res.deletedCount > 0;

    const result = await this.dataSource.query<[CommentEntityTypeOrm, number]>(
      `
      DELETE FROM comments
      WHERE id = $1
    `,
      [id],
    );

    return result[1] > 0;
  }

  public async updateById(commentId: string, body: UpdateCommentForPostDto): Promise<boolean> {
    // const isValidId = ObjectId.isValid(id);
    //
    // if (!isValidId) {
    //   return false;
    // }
    //
    // const res = await this.CommentModel.updateOne({ _id: new ObjectId(id) }, { $set: body });
    // return res.modifiedCount > 0;

    if (!commentId || !Number.isInteger(+commentId)) {
      return false;
    }

    const result = await this.dataSource.query<[CommentEntityTypeOrm[], number]>(
      `
        UPDATE comments
        SET content = $2
        WHERE id = $1
        RETURNING *;
    `,
      [commentId, body.content],
    );

    return result[1] > 0;
  }

  public async deleteMany(): Promise<boolean> {
    // const res = await this.CommentModel.deleteMany({});
    // return res.deletedCount > 0;

    const result = await this.dataSource.query(`
      DELETE FROM comments
      WHERE id > 0;
    `);

    return result[1] > 0;
  }

  // public async updateUserBanStatus(userId: ObjectId, isBanned: boolean) {
  //   await this.CommentModel.updateMany({ 'commentatorInfo.id': userId }, { 'commentatorInfo.isBanned': isBanned });
  // }
  //
  // public async updateBanStatusByBlogId(blogId: ObjectId, isBanned: boolean) {
  //   await this.CommentModel.updateOne({ blogId }, { isBanned });
  // }
}
