import { CqrsModule } from '@nestjs/cqrs';
import { Module } from '@nestjs/common';
import { CreateBlogForBloggerHandler } from '../Blogs/handlers/blogger/create-blog-for-blogger.handler';
import { FindAllBloggerBlogsHandler } from '../Blogs/handlers/blogger/find-all-blogger-blogs.handler';
import { BloggerBlogsController } from './controllers/blogger-blogs.controller';
import { UsersQueryRepository } from '../Users/repositories/users.query.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import UserEntity from '../../db/entities/user.entity';
import BlogEntity from '../../db/entities/blog.entity';
import { BlogsQueryRepository } from '../Blogs/repositories/blogs.query.repository';
import { BlogsWriteRepository } from '../Blogs/repositories/blogs.write.repository';
import { UpdateBlogForBloggerHandler } from '../Blogs/handlers/blogger/update-blog-for-blogger.handler';
import { CheckAccessToBlogCommand, CheckAccessToBlogHandler } from './handlers/check-access-to-blog.handler';
import { DeleteBlogForBloggerHandler } from '../Blogs/handlers/blogger/delete-blog-for-blogger.handler';
import { FindAllPostsByBlogIdHandler } from '../Posts/handlers/find-all-posts-for-blog.handler';
import { PostsQueryRepository } from '../Posts/repositories/posts.query.repository';
import { ReactionsQueryRepository } from '../Reactions/repositories/reactions.query.repository';
import ReactionEntity from '../../db/entities/reaction.entity';
import PostEntity from '../../db/entities/post.entity';
import { CheckAccessToBlogAndPostHandler } from './handlers/check-access-to-blog-and-post.hander';
import { BloggerUsersController } from './controllers/blogger-users.controller';
import { BanUnbanUserForBlogHandler } from '../Blogs/handlers/blogger/ban-unban-user-for-blog.handler';
import { BannedUserInBlogWriteRepository } from '../BannedUserInBlog/repositories/banned-user-in-blog.write.repository';
import { BannedUserInBlogQueryRepository } from '../BannedUserInBlog/repositories/banned-user-in-blog.query.repository';
import BannedUserInBlogEntity from '../../db/entities/banned-user-in-blog.entity';
import { FindAllBannedUsersForBlogHandler } from './handlers/find-all-banned-users-for-blog.handler';
import { FindAllCommentsByBloggerIdHandler } from '../Comments/handlers/find-all-comments-by-blogger-id.handler';
import CommentEntity from '../../db/entities/comment.entity';
import { CommentsQueryRepository } from '../Comments/repositories/comments.query.repository';
import { UploadBackgroundWallpaperHandler } from '../Blogs/handlers/blogger/upload-background-wallpaper.handler';
import { UploadToS3Service } from '../UploadToS3/upload-to-s3.service';
import { BlogWallpapersWriteRepository } from '../BlogWallpapers/repositories/blog-wallpapers.write.repository';
import BlogWallpapersEntity from '../../db/entities/blog-wallpapers.entity';
import { UploadMainImageForBlogHandler } from '../Blogs/handlers/blogger/upload-main-image-for-blog.handler';
import BlogMainImagesEntity from '../../db/entities/blog-main-images.entity';
import { BlogMainImagesWriteRepository } from '../BlogWallpapers/repositories/blog-main-images.write.repository';
import { UploadMainImageForPostHandler } from '../Blogs/handlers/blogger/upload-main-image-for-post.handler';
import PostMainImagesEntity from '../../db/entities/post-main-images.entity';
import { PostMainImagesWriteRepository } from '../PostMainImages/repositories/post-main-images.write.repository';

export const CommandHandlers = [
  FindAllBloggerBlogsHandler,
  CreateBlogForBloggerHandler,
  UpdateBlogForBloggerHandler,
  CheckAccessToBlogHandler,
  DeleteBlogForBloggerHandler,
  FindAllPostsByBlogIdHandler,
  CheckAccessToBlogCommand,
  CheckAccessToBlogAndPostHandler,
  BanUnbanUserForBlogHandler,
  FindAllBannedUsersForBlogHandler,
  FindAllCommentsByBloggerIdHandler,
  UploadBackgroundWallpaperHandler,
  UploadMainImageForBlogHandler,
  UploadMainImageForPostHandler,
];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([
      UserEntity,
      BlogEntity,
      PostEntity,
      ReactionEntity,
      BannedUserInBlogEntity,
      CommentEntity,
      BlogMainImagesEntity,
      BlogWallpapersEntity,
      PostMainImagesEntity,
    ]),
  ],
  controllers: [BloggerBlogsController, BloggerUsersController],
  providers: [
    BlogsQueryRepository,
    BlogsWriteRepository,
    UsersQueryRepository,
    PostsQueryRepository,
    ReactionsQueryRepository,
    BannedUserInBlogWriteRepository,
    BannedUserInBlogQueryRepository,
    CommentsQueryRepository,
    UploadToS3Service,
    BlogWallpapersWriteRepository,
    BlogMainImagesWriteRepository,
    PostMainImagesWriteRepository,
    ...CommandHandlers,
  ],
})
export class BloggerModule {}
