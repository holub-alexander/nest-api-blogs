import { Injectable } from '@nestjs/common';
import { UpdatePostDto } from '../dto/update.dto';

import PostEntityTypeOrm from '../../../db/entities/typeorm/post.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class PostsWriteRepository {
  constructor(private readonly dataSource: DataSource) {}

  public async create(createdPost: PostEntityTypeOrm): Promise<PostEntityTypeOrm | null> {
    const result = await this.dataSource.query(
      `
      WITH inserted_post AS (
        INSERT INTO posts (
            title,
            short_description,
            content,
            blog_id,
            created_at
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      ) 
      SELECT inserted_post.*, blogs.name AS blog_name FROM inserted_post
      JOIN blogs ON blogs.id = inserted_post.blog_id;
    `,
      [
        createdPost.title,
        createdPost.short_description,
        createdPost.content,
        createdPost.blog_id,
        createdPost.created_at,
      ],
    );

    return result[0] || null;
  }

  public async deleteOne(postId: string): Promise<boolean> {
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
}
