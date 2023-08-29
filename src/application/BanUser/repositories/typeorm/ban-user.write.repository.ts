import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import BannedUserInBlogEntity from '../../../../db/entities/typeorm/banned-user-in-blog.entity';

@Injectable()
export class BanUserTypeOrmWriteRepository {
  constructor(private readonly dataSource: DataSource) {}

  public async create(bannedUser: BannedUserInBlogEntity): Promise<BannedUserInBlogEntity> {
    const result = await this.dataSource.query(
      `
      INSERT INTO banned_users_in_blogs (
        ban_reason,
        blog_id,
        created_at,
        is_banned,
        user_id
     )
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *;
    `,
      [bannedUser.ban_reason, bannedUser.blog_id, bannedUser.created_at, bannedUser.is_banned, bannedUser.user_id],
    );

    return result[0] || null;
  }

  public async unbanUserForBlog(userId: number, blogId: number) {
    // return this.BanUserModel.deleteOne({ blogId, 'user.id': userId });

    const result = await this.dataSource.query<[BannedUserInBlogEntity, number]>(
      `
      DELETE FROM banned_users_in_blogs
      WHERE user_id = $1 AND blog_id = $2;
    `,
      [userId, blogId],
    );

    return result[1] > 0;
  }
}
