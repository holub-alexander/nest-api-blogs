import BannedUserInBlogEntity from '../../../db/entities/banned-user-in-blog.entity';
import { UserBloggerViewModel } from '../../Blogger/interfaces';

export class BannedUserInBlogMapper {
  public static mapUserBloggerViewModel(items: BannedUserInBlogEntity[]): UserBloggerViewModel[] {
    return items.map((banUser): UserBloggerViewModel => {
      return {
        id: banUser.user.id.toString(),
        login: banUser.user.login,
        banInfo: {
          banDate: banUser.created_at.toISOString(),
          isBanned: banUser.is_banned,
          banReason: banUser.ban_reason,
        },
      };
    });
  }
}
