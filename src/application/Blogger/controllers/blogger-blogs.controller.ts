import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpCode,
  MaxFileSizeValidator,
  NotFoundException,
  Param,
  ParseFilePipe,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import { SkipThrottle } from '@nestjs/throttler';
import { CommandBus } from '@nestjs/cqrs';
import { PaginationBlogDto } from '../../Blogs/dto/pagination-blog.dto';
import { Paginator } from '../../../common/interfaces';
import { BlogViewModel } from '../../Blogs/interfaces';
import { CreateBlogDto } from '../../Blogs/dto/create.dto';
import { UpdateBlogDto } from '../../Blogs/dto/update.dto';
import { CreatePostFromBlog } from '../../Posts/dto/create.dto';
import { CreatePostCommand } from '../../Posts/handlers/create-post.handler';
import { UpdatePostDto } from '../../Posts/dto/update.dto';
import { UpdatePostCommand } from '../../Posts/handlers/update-post.handler';
import { JwtTokenGuard } from '../../Auth/guards/jwt-token.guard';
import { DeleteOnePostCommand } from '../../Posts/handlers/delete-one-post.handler';
import { FindAllPostsByBlogIdCommand } from '../../Posts/handlers/find-all-posts-for-blog.handler';
import { FindAllBloggerBlogsBloggerCommand } from '../../Blogs/handlers/blogger/find-all-blogger-blogs.handler';
import { CreateBlogForBloggerCommand } from '../../Blogs/handlers/blogger/create-blog-for-blogger.handler';
import { UpdateBlogForBloggerCommand } from '../../Blogs/handlers/blogger/update-blog-for-blogger.handler';
import { DeleteBlogForBloggerCommand } from '../../Blogs/handlers/blogger/delete-blog-for-blogger.handler';
import { CheckAccessToBlogCommand } from '../handlers/check-access-to-blog.handler';
import { PostViewModel } from '../../Posts/interfaces';
import { UsersQueryRepository } from '../../Users/repositories/users.query.repository';
import { CheckAccessToBlogAndPostCommand } from '../handlers/check-access-to-blog-and-post.hander';
import { PaginationOptionsDto } from '../../../common/dto/pagination-options.dto';
import { FindAllCommentsByBloggerIdCommand } from '../../Comments/handlers/find-all-comments-by-blogger-id.handler';
import { FileInterceptor } from '@nestjs/platform-express';
import { MaxImageSizeValidator } from '../../UploadToS3/validators/max-image-size.validator';
import { SizeTransformer } from '../../../common/utils/size-transformer';
import { UploadBackgroundWallpaperCommand } from '../../Blogs/handlers/blogger/upload-background-wallpaper.handler';
import { UploadMainImageForBlogCommand } from '../../Blogs/handlers/blogger/upload-main-image-for-blog.handler';
import { UploadMainImageForPostCommand } from '../../Blogs/handlers/blogger/upload-main-image-for-post.handler';

@SkipThrottle()
@Controller('blogger/blogs')
export class BloggerBlogsController {
  constructor(private readonly commandBus: CommandBus, private readonly usersQueryRepository: UsersQueryRepository) {}

  @Post('/:id/images/wallpaper')
  @UseGuards(JwtTokenGuard)
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(201)
  public async uploadWallpaper(
    @Req() req: Request,
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
          new MaxImageSizeValidator({ maxWidth: 1028, maxHeight: 312 }), // 1028 x 312
          new MaxFileSizeValidator({ maxSize: SizeTransformer.kilobytesToBytes(100) }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.commandBus.execute(new UploadBackgroundWallpaperCommand(id, file, req.user.login));
  }

  @Post('/:id/images/main')
  @UseGuards(JwtTokenGuard)
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(201)
  public async uploadMainImage(
    @Req() req: Request,
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
          new MaxImageSizeValidator({ maxWidth: 156, maxHeight: 156 }), // 156 x 156
          new MaxFileSizeValidator({ maxSize: SizeTransformer.kilobytesToBytes(100) }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.commandBus.execute(new UploadMainImageForBlogCommand(id, file, req.user.login));
  }

  @Post('/:blogId/posts/:postId/images/main')
  @UseGuards(JwtTokenGuard)
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(201)
  public async uploadMainImageForPost(
    @Req() req: Request,
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
          new MaxImageSizeValidator({ maxWidth: 940, maxHeight: 432 }), // 940 x 432
          new MaxFileSizeValidator({ maxSize: SizeTransformer.kilobytesToBytes(100) }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.commandBus.execute(new UploadMainImageForPostCommand(blogId, postId, file, req.user.login));
  }

  @Put('/:id')
  @UseGuards(JwtTokenGuard)
  @HttpCode(204)
  public async updateOne(@Param('id') id: string, @Body() body: UpdateBlogDto, @Req() req: Request) {
    return this.commandBus.execute(new UpdateBlogForBloggerCommand(id, body, req.user.login));
  }

  @Delete('/:id')
  @UseGuards(JwtTokenGuard)
  @HttpCode(204)
  public async deleteOne(@Param('id') id: string, @Req() req: Request) {
    return this.commandBus.execute(new DeleteBlogForBloggerCommand(id, req.user.login));
  }

  @Get()
  @UseGuards(JwtTokenGuard)
  public async findAll(
    @Query() queryParams: PaginationBlogDto,
    @Req() req: Request,
  ): Promise<Paginator<BlogViewModel[]>> {
    return this.commandBus.execute(new FindAllBloggerBlogsBloggerCommand(queryParams, req.user.login));
  }

  @Post()
  @UseGuards(JwtTokenGuard)
  @HttpCode(201)
  public async create(@Body() body: CreateBlogDto, @Req() req: Request) {
    return this.commandBus.execute(new CreateBlogForBloggerCommand(body, req.user.login));
  }

  @Get('/:id/posts')
  @UseGuards(JwtTokenGuard)
  public async findAllPosts(
    @Req() req: Request,
    @Param('id') id: string,
    @Query() queryParams: PaginationBlogDto,
  ): Promise<Paginator<PostViewModel[]>> {
    await this.commandBus.execute(new CheckAccessToBlogCommand(id, req.user.login));

    return this.commandBus.execute(new FindAllPostsByBlogIdCommand(queryParams, id, req.user.login));
  }

  @Post('/:id/posts')
  @UseGuards(JwtTokenGuard)
  @HttpCode(201)
  public async createPostForCurrentBlog(
    @Param('id') id: string,
    @Body() body: CreatePostFromBlog,
    @Req() req: Request,
  ) {
    const blog = await this.commandBus.execute(new CheckAccessToBlogCommand(id, req.user.login));
    const user = await this.usersQueryRepository.findByLogin(req.user.login);

    if (!user) {
      throw new NotFoundException();
    }

    return this.commandBus.execute(new CreatePostCommand(body, blog.id));
  }

  @Put('/:blogId/posts/:postId')
  @UseGuards(JwtTokenGuard)
  @HttpCode(204)
  public async updateOnePost(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
    @Body() body: UpdatePostDto,
    @Req() req: Request,
  ) {
    await this.commandBus.execute(new CheckAccessToBlogAndPostCommand(blogId, postId, req.user.login));

    const isUpdated = await this.commandBus.execute(new UpdatePostCommand(postId, body));

    if (!isUpdated) {
      throw new NotFoundException({});
    }

    return true;
  }

  @Delete('/:blogId/posts/:postId')
  @UseGuards(JwtTokenGuard)
  @HttpCode(204)
  public async deleteOnePost(@Param('blogId') blogId: string, @Param('postId') postId: string, @Req() req: Request) {
    await this.commandBus.execute(new CheckAccessToBlogAndPostCommand(blogId, postId, req.user.login));

    const isDeleted = await this.commandBus.execute(new DeleteOnePostCommand(postId));

    if (!isDeleted) {
      throw new NotFoundException({});
    }

    return true;
  }

  @Get('/comments')
  @UseGuards(JwtTokenGuard)
  public async findAllBloggerComments(@Query() queryParams: PaginationOptionsDto, @Req() req: Request) {
    return this.commandBus.execute(new FindAllCommentsByBloggerIdCommand(queryParams, req.user.login));
  }
}
