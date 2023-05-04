import { BlogDocument } from '../../../entity/blog.entity';
import { BlogViewModelSuperAdmin } from '../../Blogs/interfaces';

export class SuperAdminMapper {
  public static mapBlogsViewModel(data: BlogDocument[]): BlogViewModelSuperAdmin[] {
    return data.map(
      (blog): BlogViewModelSuperAdmin => ({
        id: blog._id.toString(),
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl,
        createdAt: blog.createdAt,
        isMembership: blog.isMembership,
        blogOwnerInfo: {
          userId: blog.bloggerInfo.id.toString(),
          userLogin: blog.bloggerInfo.login,
        },
        banInfo: {
          isBanned: blog.banInfo.isBanned,
          banDate: blog.banInfo.banDate,
        },
      }),
    );
  }
}
