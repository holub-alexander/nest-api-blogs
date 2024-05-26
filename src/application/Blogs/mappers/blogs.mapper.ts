import { BlogImagesViewModel, BlogViewModel } from '../interfaces';
import BlogEntity from '../../../db/entities/blog.entity';
import BlogWallpapersEntity from '../../../db/entities/blog-wallpapers.entity';
import BlogMainImagesEntity from '../../../db/entities/blog-main-images.entity';
import { createPublicImageUrl } from '../../UploadToS3/utils/create-public-image-url';
import PostMainImagesEntity from '../../../db/entities/post-main-images.entity';
import { PostImagesViewModel } from '../../Posts/interfaces';

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
        images: this.mapBlogImageInformation(blog.blog_wallpaper, blog.blog_main_images),
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
      images: this.mapBlogImageInformation(blog.blog_wallpaper, blog.blog_main_images),
    };
  }

  public static mapBlogImageInformation(
    wallpaperImage: BlogWallpapersEntity | null,
    mainImages: BlogMainImagesEntity[] | [],
  ): BlogImagesViewModel {
    return {
      wallpaper: wallpaperImage
        ? {
            url: createPublicImageUrl(wallpaperImage.file_path, wallpaperImage.file_name, wallpaperImage.bucket_name),
            width: wallpaperImage.width || 0,
            height: wallpaperImage.height || 0,
            fileSize: wallpaperImage.file_size_in_bytes || 0,
          }
        : null,
      main:
        mainImages && mainImages.length > 0
          ? mainImages.map((mainImage) => ({
              url: createPublicImageUrl(mainImage.file_path, mainImage.file_name, mainImage.bucket_name),
              width: mainImage.width || 0,
              height: mainImage.height || 0,
              fileSize: mainImage.file_size_in_bytes || 0,
            }))
          : [],
    };
  }

  public static mapPostMainImages(postMainImages: PostMainImagesEntity[]): PostImagesViewModel {
    return {
      main:
        postMainImages && postMainImages.length > 0
          ? postMainImages.map((mainImage) => ({
              url: createPublicImageUrl(mainImage.file_path, mainImage.file_name, mainImage.bucket_name),
              width: mainImage.width || 0,
              height: mainImage.height || 0,
              fileSize: mainImage.file_size_in_bytes || 0,
            }))
          : [],
    };
  }
}
