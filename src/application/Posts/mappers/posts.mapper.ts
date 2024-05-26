import { NewestLike, PostImagesViewModel, PostViewModel } from '../interfaces';
import { LikeStatuses } from '../../../common/interfaces';
import PostEntity from '../../../db/entities/post.entity';
import ReactionEntity from '../../../db/entities/reaction.entity';
import PostMainImagesEntity from '../../../db/entities/post-main-images.entity';
import { createPublicImageUrl } from '../../UploadToS3/utils/create-public-image-url';

export class PostsMapper {
  public static mapNewestLikes(reactions: ReactionEntity[]): NewestLike[] {
    return reactions.map(
      (reaction): NewestLike => ({
        addedAt: reaction.created_at,
        userId: reaction.user_id.toString(),
        login: reaction.user_login,
      }),
    );
  }

  public static mapPostsViewModel(data: PostEntity[], lastReactions: ReactionEntity[]): PostViewModel[] {
    return data.map(
      (post): PostViewModel => ({
        id: post.id.toString(),
        title: post.title,
        shortDescription: post.short_description,
        content: post.content,
        blogId: post.blog_id.toString(),
        blogName: post.blog.name,
        createdAt: post.created_at,
        extendedLikesInfo: {
          dislikesCount: +post.dislikes_count,
          likesCount: +post.likes_count,
          myStatus: LikeStatuses.NONE,
          newestLikes: this.mapNewestLikes(lastReactions),
        },
        images: this.mapPostMainImages(post.post_main_images),
      }),
    );
  }

  public static mapPostViewModel(
    post: PostEntity,
    reaction: ReactionEntity | null,
    lastReactions: ReactionEntity[] | [],
    likesCount: number,
    dislikesCount: number,
  ): PostViewModel {
    return {
      id: post.id.toString(),
      title: post.title,
      shortDescription: post.short_description,
      content: post.content,
      blogId: post.blog_id.toString(),
      blogName: post.blog ? post.blog.name : post.blog_name,
      createdAt: post.created_at,
      extendedLikesInfo: {
        dislikesCount: +dislikesCount,
        likesCount: +likesCount,
        myStatus: reaction ? reaction.like_status : LikeStatuses.NONE,
        newestLikes: this.mapNewestLikes(lastReactions),
      },
      images: this.mapPostMainImages(post.post_main_images),
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
