import { BlogViewModel } from '../interfaces';
import BlogEntityTypeOrm from '../../../db/entities/typeorm/blog.entity';

export class BlogsMapper {
  public static mapBlogsViewModel(data: BlogEntityTypeOrm[]): BlogViewModel[] {
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

  public static mapBlogViewModel(blog: BlogEntityTypeOrm): BlogViewModel {
    console.log('blog', blog);

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
