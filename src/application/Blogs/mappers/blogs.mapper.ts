import { BlogViewModel } from '../interfaces';
import BlogEntity from '../../../db/entities/blog.entity';

export class BlogsMapper {
  public static mapBlogsViewModel(data: BlogEntity[]): BlogViewModel[] {
    return data.map(
      (blog): BlogViewModel => ({
        id: blog.id.toString(),
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.website_url,
        createdAt: blog.created_at,
        isMembership: blog.is_membership,
      }),
    );
  }

  public static mapBlogViewModel(blog: BlogEntity): BlogViewModel {
    return {
      id: blog.id.toString(),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.website_url,
      createdAt: blog.created_at,
      isMembership: blog.is_membership,
    };
  }
}
