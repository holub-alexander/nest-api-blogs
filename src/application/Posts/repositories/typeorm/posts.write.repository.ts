import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { UpdatePostDto } from '../../dto/update.dto';
import { Post, PostDocument } from '../../../../db/entities/mongoose/post.entity';
import PostEntityTypeOrm from '../../../../db/entities/typeorm/post.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class PostsTypeOrmWriteRepository {
  constructor(
    @InjectModel(Post.name) private readonly PostModel: Model<PostDocument>,
    private readonly dataSource: DataSource,
  ) {}

  // public async save(doc: PostDocument): Promise<PostDocument> {
  //   return doc.save();
  // }

  public async create(createdPost: PostEntityTypeOrm): Promise<PostEntityTypeOrm | null> {
    const result = await this.dataSource.query(
      `
      WITH inserted_post AS (
        INSERT INTO posts (
            title,
            short_description,
            content,
            blog_id,
            created_at,
            is_banned,
            likes_count,
            dislikes_count,
            user_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      ) 
      SELECT inserted_post.*, users.id AS user_id, users.is_banned AS user_is_banned, blogs.name AS blog_name FROM inserted_post
      JOIN users ON users.id = inserted_post.user_id
      JOIN blogs ON blogs.id = inserted_post.blog_id;
    `,
      [
        createdPost.title,
        createdPost.short_description,
        createdPost.content,
        createdPost.blog_id,
        createdPost.created_at,
        createdPost.is_banned,
        createdPost.likes_count,
        createdPost.dislikes_count,
        createdPost.user_id,
      ],
    );

    return result[0] || null;
  }

  public async deleteOne(postId: string): Promise<boolean> {
    // const isValidId = ObjectId.isValid(postId);
    //
    // if (isValidId) {
    //   const res = await this.PostModel.deleteOne({ _id: new ObjectId(postId) });
    //   return res.deletedCount > 0;
    // }
    //
    // return false;

    if (!postId || !Number.isInteger(+postId)) {
      return false;
    }

    const result = await this.dataSource.query<[PostEntityTypeOrm, number]>(
      `
      DELETE FROM posts
      WHERE id = $1;
    `,
      [postId],
    );

    return result[1] > 0;
  }

  public async updateOne(postId: string, data: UpdatePostDto): Promise<boolean> {
    // const isValidId = ObjectId.isValid(postId);
    //
    // if (isValidId) {
    //   const res = await this.PostModel.updateOne({ _id: postId }, { $set: data });
    //   return res.modifiedCount > 0;
    // }
    //
    // return false;

    if (!postId || !Number.isInteger(+postId)) {
      return false;
    }

    const result = await this.dataSource.query<[PostEntityTypeOrm[], number]>(
      `
        UPDATE posts
        SET title = $2,
            short_description = $3,
            content = $4
        WHERE id = $1;
    `,
      [postId, data.title, data.shortDescription, data.content],
    );

    return result[1] > 0;
  }

  public async deleteMany(): Promise<boolean> {
    const result = await this.dataSource.query(`
      DELETE FROM posts
      WHERE id > 0;
    `);

    return result[1] > 0;
  }

  // public async updateUserBanStatus(userId: ObjectId, isBanned: boolean) {
  //   await this.PostModel.updateMany({ 'userInfo.id': userId }, { 'userInfo.isBanned': isBanned });
  // }
  //
  // public async updateBanStatusByBlogId(blogId: ObjectId, isBanned: boolean) {
  //   await this.PostModel.updateOne({ 'blog.id': blogId }, { isBanned });
  // }
}
