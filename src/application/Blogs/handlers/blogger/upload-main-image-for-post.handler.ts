import { CommandBus, CommandHandler } from '@nestjs/cqrs';
import { UploadToS3Service } from '../../../UploadToS3/upload-to-s3.service';

import { CheckAccessToBlogAndPostCommand } from '../../../Blogger/handlers/check-access-to-blog-and-post.hander';
import { ImageSizeVariants } from '../../../../common/interfaces';
import { generateThumbnailImage } from '../../../UploadToS3/utils/generate-thumbnail-image';
import { PostMainImagesWriteRepository } from '../../../PostMainImages/repositories/post-main-images.write.repository';
import { PostsQueryRepository } from 'src/application/Posts/repositories/posts.query.repository';
import { ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { BlogsMapper } from '../../mappers/blogs.mapper';

export class UploadMainImageForPostCommand {
  constructor(
    public blogId: string,
    public postId: string,
    public file: Express.Multer.File,
    public userLogin: string,
  ) {}
}

@CommandHandler(UploadMainImageForPostCommand)
export class UploadMainImageForPostHandler {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly uploadService: UploadToS3Service,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly postMainImagesWriteRepository: PostMainImagesWriteRepository,
  ) {}

  public async execute(command: UploadMainImageForPostCommand) {
    const { blogId, postId, file, userLogin } = command;
    const uploadTasks = [
      { size: ImageSizeVariants.Original, width: 600, height: 600 },
      { size: ImageSizeVariants.Middle, width: 300, height: 180 },
      { size: ImageSizeVariants.Small, width: 149, height: 96 },
    ];

    const foundBlog = await this.commandBus.execute(new CheckAccessToBlogAndPostCommand(blogId, postId, userLogin));
    const foundPost = await this.postsQueryRepository.findOne(command.postId);

    if (!foundPost) {
      throw new ForbiddenException();
    }

    try {
      const thumbnailImages = await Promise.all(
        uploadTasks.map(async (task) => {
          if (task.size === ImageSizeVariants.Original) {
            return file.buffer;
          }

          return generateThumbnailImage(file.buffer, { width: task.width, height: task.height });
        }),
      );

      const uploadImages = await Promise.all(
        thumbnailImages.map((image) => {
          return this.uploadService.uploadFile(image, 'posts/main');
        }),
      );

      if (uploadImages.length !== uploadTasks.length) {
        throw new Error('Error while uploading images');
      }

      const createPostMainImages = uploadImages.map((image, index) => {
        return this.postMainImagesWriteRepository.create({
          size_variant: uploadTasks[index].size,
          width: image.metadata.width ?? 0,
          height: image.metadata.height ?? 0,
          file_size_in_bytes: image.metadata.size ?? 0,
          file_name: image.fileName,
          file_path: image.folder,
          bucket_name: image.bucketName,
          created_at: new Date(),
          blog: foundBlog,
          post: foundPost,
        });
      });

      await this.postMainImagesWriteRepository.save(createPostMainImages);

      return BlogsMapper.mapPostMainImages(createPostMainImages);
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException();
    }
  }
}
