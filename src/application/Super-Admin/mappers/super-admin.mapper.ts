import { BlogViewModelSuperAdmin } from '../../Blogs/interfaces';
import BlogEntityTypeOrm from '../../../db/entities/typeorm/blog.entity';

export class SuperAdminMapper {
  public static mapBlogsViewModel(data: BlogEntityTypeOrm[]): BlogViewModelSuperAdmin[] {
    return data.map(
      (blog): BlogViewModelSuperAdmin => ({
        id: blog.id.toString(),
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.website_url,
        createdAt: blog.created_at,
        isMembership: blog.is_membership,
        blogOwnerInfo: {
          userId: blog.user_id.toString(),
          userLogin: blog.user_login,
        },
        banInfo: {
          isBanned: blog.is_banned,
          banDate: blog.ban_date ? blog.ban_date.toISOString() : new Date().toISOString(),
        },
      }),
    );
  }
}
