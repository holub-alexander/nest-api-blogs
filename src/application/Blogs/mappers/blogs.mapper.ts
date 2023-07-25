import { BlogViewModel } from '../interfaces';
import { BlogDocument } from '../../../db/entities/mongoose/blog.entity';

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
