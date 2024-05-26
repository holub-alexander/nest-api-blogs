import { CheckAccessToBlogCommand } from '../../../Blogger/handlers/check-access-to-blog.handler';
import { CommandBus, CommandHandler } from '@nestjs/cqrs';
import { UploadToS3Service } from '../../../UploadToS3/upload-to-s3.service';
import { BlogWallpapersWriteRepository } from '../../../BlogWallpapers/repositories/blog-wallpapers.write.repository';
import { BlogsMapper } from '../../mappers/blogs.mapper';
import { BlogMainImagesWriteRepository } from '../../../BlogWallpapers/repositories/blog-main-images.write.repository';

export class UploadBackgroundWallpaperCommand {
  constructor(public id: string, public file: Express.Multer.File, public userLogin: string) {}
}

@CommandHandler(UploadBackgroundWallpaperCommand)
export class UploadBackgroundWallpaperHandler {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly uploadService: UploadToS3Service,
    private readonly blogWallpapersWriteRepository: BlogWallpapersWriteRepository,
    private readonly blogMainImagesWriteRepository: BlogMainImagesWriteRepository,
  ) {}

  public async execute(command: UploadBackgroundWallpaperCommand) {
    const { id, file, userLogin } = command;

    const currentBlog = await this.commandBus.execute(new CheckAccessToBlogCommand(id, userLogin));

    const uploadedImage = await this.uploadService.uploadFile(file.buffer);
    const { fileName, bucketName, folder, metadata } = uploadedImage;

    const createdWallpaper = this.blogWallpapersWriteRepository.create({
      blog: currentBlog,
      width: metadata.width,
      height: metadata.height,
      file_size_in_bytes: file.size,
      file_name: fileName,
      file_path: folder,
      bucket_name: bucketName,
      created_at: new Date(),
    });

    await this.blogWallpapersWriteRepository.save(createdWallpaper);

    const blogMainImages = await this.blogMainImagesWriteRepository.find({
      where: { blog_id: currentBlog.id.toString() },
    });

    return BlogsMapper.mapBlogImageInformation(createdWallpaper, blogMainImages);
  }
}
