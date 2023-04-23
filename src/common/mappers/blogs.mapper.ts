import { BlogViewModel, BlogViewModelSuperAdmin } from '../../application/Blogs/interfaces';
import { BlogDocument } from '../../entity/blog.entity';

export class BlogsMapper {
  public static mapBlogsViewModel(data: BlogDocument[]): BlogViewModel[] {
    return data.map(
      (blog): BlogViewModel => ({
        id: blog._id.toString(),
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl,
        createdAt: blog.createdAt,
        isMembership: blog.isMembership,
      }),
    );
  }

  public static mapBlogsViewModelSuperAdmin(data: BlogDocument[]): BlogViewModelSuperAdmin[] {
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
      }),
    );
  }

  public static mapBlogViewModel(blog: BlogDocument): BlogViewModel {
    return {
      id: blog._id.toString(),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
    };
  }
}
