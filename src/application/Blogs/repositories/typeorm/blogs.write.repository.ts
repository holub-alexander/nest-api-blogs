// @ts-nocheck

import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from '../../../../db/entities/mongoose/blog.entity';
import { UpdateBlogDto } from '../../dto/update.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import UserEntityTypeOrm from '../../../../db/entities/typeorm/user.entity';
import BlogEntityTypeOrm from '../../../../db/entities/typeorm/blog.entity';

@Injectable()
export class BlogsTypeOrmWriteRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  public async create(createdBlog: BlogEntityTypeOrm): Promise<BlogEntityTypeOrm | null> {
    const result = await this.dataSource.query(
      `
      INSERT INTO blogs (
        name,
        description,
        website_url,
        created_at,
        is_membership,
        user_id,
        ban_date,
        is_banned
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *;
    `,
      [
        createdBlog.name,
        createdBlog.description,
        createdBlog.website_url,
        createdBlog.created_at,
        createdBlog.is_membership,
        createdBlog.user_id,
        createdBlog.ban_date,
        createdBlog.is_banned,
      ],
    );

    return result[0] || null;
  }

  public async deleteOne(blogId: string): Promise<boolean> {
    // const isValidId = ObjectId.isValid(blogId);
    //
    // if (isValidId) {
    //   const res = await this.BlogModel.deleteOne({ _id: new ObjectId(blogId) });
    //   return res.deletedCount > 0;
    // }
    //
    // return false;

    if (!blogId || !Number.isInteger(+blogId)) {
      return false;
    }

    const result = await this.dataSource.query<[UserEntityTypeOrm, number]>(
      `
      DELETE FROM blogs
      WHERE id = $1;
    `,
      [blogId],
    );

    return result[1] > 0;
  }

  public async updateOne(blogId: string, data: UpdateBlogDto): Promise<boolean> {
    // const isValidId = ObjectId.isValid(blogId);
    //
    // if (isValidId) {
    //   const res = await this.BlogModel.updateOne({ _id: new ObjectId(blogId) }, { $set: data });
    //   return res.modifiedCount > 0;
    // }
    //
    // return false;

    if (!blogId || !Number.isInteger(+blogId)) {
      return false;
    }

    const result = await this.dataSource.query<[UserEntityTypeOrm[], number]>(
      `
        UPDATE blogs
        SET name = $2,
            description = $3,
            website_url = $4
        WHERE id = $1
        RETURNING *;
    `,
      [blogId, data.name, data.description, data.websiteUrl],
    );

    return result[1] > 0;
  }

  public async deleteMany(): Promise<boolean> {
    const result = await this.dataSource.query(`
      DELETE FROM blogs
      WHERE id > 0;
    `);

    return result[1] > 0;
  }

  public async updateUserBanStatus(userId: ObjectId, isBanned: boolean) {
    await this.BlogModel.updateMany({ 'bloggerInfo.id': userId }, { 'bloggerInfo.isBanned': isBanned });
  }

  public async updateBanStatus(blogId: number, banDate: Date | null, isBanned: boolean): Promise<boolean> {
    // await this.BlogModel.updateOne({ _id: blogId }, { 'banInfo.isBanned': isBanned, 'banInfo.banDate': banDate });

    const result = await this.dataSource.query<[[], number]>(
      `
      UPDATE blogs
      SET is_banned = $3,
          ban_date = $2
      WHERE id = $1;
    `,
      [blogId, banDate, isBanned],
    );

    return result[1] > 0;
  }
}
