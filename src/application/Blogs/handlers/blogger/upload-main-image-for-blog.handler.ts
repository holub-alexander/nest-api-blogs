import { CheckAccessToBlogCommand } from '../../../Blogger/handlers/check-access-to-blog.handler';
import { CommandBus, CommandHandler } from '@nestjs/cqrs';
import { UploadToS3Service } from '../../../UploadToS3/upload-to-s3.service';
import { BlogsMapper } from '../../mappers/blogs.mapper';
import { BlogMainImagesWriteRepository } from '../../../BlogWallpapers/repositories/blog-main-images.write.repository';
import { BlogWallpapersWriteRepository } from '../../../BlogWallpapers/repositories/blog-wallpapers.write.repository';

export class UploadMainImageForBlogCommand {
  constructor(public id: string, public file: Express.Multer.File, public userLogin: string) {}
}

@CommandHandler(UploadMainImageForBlogCommand)
export class UploadMainImageForBlogHandler {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly uploadService: UploadToS3Service,
    private readonly blogMainImagesWriteRepository: BlogMainImagesWriteRepository,
    private readonly blogWallpaperQueryRepository: BlogWallpapersWriteRepository,
  ) {}

  public async execute(command: UploadMainImageForBlogCommand) {
    const { id, file, userLogin } = command;

    const currentBlog = await this.commandBus.execute(new CheckAccessToBlogCommand(id, userLogin));

    const uploadedImage = await this.uploadService.uploadFile(file.buffer, 'blogs/main');
    const { fileName, bucketName, folder, metadata } = uploadedImage;

    const createdWallpaper = this.blogMainImagesWriteRepository.create({
      blog: currentBlog,
      width: metadata.width,
      height: metadata.height,
      file_size_in_bytes: file.size,
      file_name: fileName,
      file_path: folder,
      bucket_name: bucketName,
      created_at: new Date(),
    });

    await this.blogMainImagesWriteRepository.save(createdWallpaper);
    const blogWallpaper = await this.blogWallpaperQueryRepository.findOne({
      where: { blog_id: currentBlog.id.toString() },
    });

    return BlogsMapper.mapBlogImageInformation(blogWallpaper, [createdWallpaper]);
  }
}
