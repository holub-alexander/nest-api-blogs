import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import BannedUserInBlogEntity from '../../../db/entities/banned-user-in-blog.entity';

@Injectable()
export class BannedUserInBlogWriteRepository extends Repository<BannedUserInBlogEntity> {
  constructor(private dataSource: DataSource) {
    super(BannedUserInBlogEntity, dataSource.createEntityManager());
  }

  public async updateBanStatus(userId: number, blogId: number, isBanned: boolean) {
    const res = await this.update({ user: { id: userId }, blog: { id: blogId } }, { is_banned: isBanned });

    return !res.affected ? false : res.affected > 0;
  }
}
