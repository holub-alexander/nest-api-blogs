import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { SkipThrottle } from '@nestjs/throttler';
import { CommandBus } from '@nestjs/cqrs';
import { BlogsWriteRepository } from '../Blogs/repositories/blogs.write.repository';
import { PaginationBlogDto } from '../Blogs/dto/pagination-blog.dto';
import { Paginator } from '../../common/interfaces';
import { BlogViewModel } from '../Blogs/interfaces';
import { FindAllBlogsCommand } from '../Blogs/handlers/find-all-blogs.handler';
import { CreateBlogDto } from '../Blogs/dto/create.dto';
import { CreateBlogCommand } from '../Blogs/handlers/create-blog.handler';
import { UpdateBlogDto } from '../Blogs/dto/update.dto';
import { CreatePostFromBlog } from '../Posts/dto/create.dto';
import { CreatePostCommand } from '../Posts/handlers/create-post.handler';
import { UpdatePostDto } from '../Posts/dto/update.dto';
import { UpdatePostCommand } from '../Posts/handlers/update-post.handler';
import { JwtTokenGuard } from '../Auth/guards/jwt-token.guard';
import { BlogDocument } from '../../entity/blog.entity';
import { BlogsQueryRepository } from '../Blogs/repositories/blogs.query.repository';
import { PostsQueryRepository } from '../Posts/repositories/posts.query.repository';
import { DeleteOnePostCommand } from '../Posts/handlers/delete-one-post.handler';
import { UsersQueryRepository } from '../Users/repositories/users.query.repository';

@SkipThrottle()
@Controller('blogger/blogs')
export class BloggerController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly blogsWriteRepository: BlogsWriteRepository,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  private async checkAccessToBlog(blogId: string, userLogin: string): Promise<BlogDocument | never> {
    const foundBlog = await this.blogsQueryRepository.findOne(blogId);

    if (!foundBlog) {
      throw new NotFoundException({});
    }

    if (foundBlog.bloggerInfo?.login !== userLogin) {
      throw new ForbiddenException();
    }

    return foundBlog;
  }

  private async checkAccessToBlogAndPost(
    blogId: string,
    postId: string,
    userLogin: string,
  ): Promise<BlogDocument | never> {
    console.log(blogId, postId, userLogin);

    const foundBlog = await this.blogsQueryRepository.findOne(blogId);
    const foundPost = await this.postsQueryRepository.findOne(postId);

    if (!foundBlog || !foundPost) {
      throw new NotFoundException({});
    }

    if (foundBlog.bloggerInfo?.login !== userLogin || foundPost.blog.id.toString() !== foundBlog._id.toString()) {
      throw new ForbiddenException();
    }

    return foundBlog;
  }

  @Put('/:id')
  @UseGuards(JwtTokenGuard)
  @HttpCode(204)
  public async updateOne(@Param('id') id: string, @Body() body: UpdateBlogDto, @Req() req: Request) {
    await this.checkAccessToBlog(id, req.user.login);

    const isUpdated = await this.blogsWriteRepository.updateOne(id, body);

    if (!isUpdated) {
      throw new NotFoundException({});
    }

    return true;
  }

  @Delete('/:id')
  @UseGuards(JwtTokenGuard)
  @HttpCode(204)
  public async deleteOne(@Param('id') id: string, @Req() req: Request) {
    await this.checkAccessToBlog(id, req.user.login);

    const isDeleted = await this.blogsWriteRepository.deleteOne(id);

    if (!isDeleted) {
      throw new NotFoundException({});
    }

    return true;
  }

  @Post()
  @UseGuards(JwtTokenGuard)
  @HttpCode(201)
  public async create(@Body() body: CreateBlogDto, @Req() req: Request) {
    return this.commandBus.execute(new CreateBlogCommand(body, req.user.login));
  }

  @Get()
  @UseGuards(JwtTokenGuard)
  public async findAll(@Query() queryParams: PaginationBlogDto): Promise<Paginator<BlogViewModel[]>> {
    return this.commandBus.execute(new FindAllBlogsCommand(queryParams));
  }

  @Post('/:id/posts')
  @UseGuards(JwtTokenGuard)
  @HttpCode(201)
  public async createPostForCurrentBlog(
    @Param('id') id: string,
    @Body() body: CreatePostFromBlog,
    @Req() req: Request,
  ) {
    const findBlog = await this.checkAccessToBlog(id, req.user.login);
    const user = await this.usersQueryRepository.findByLogin(req.user.login);

    return this.commandBus.execute(new CreatePostCommand(body, findBlog.id.toString(), user!._id));
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
    await this.checkAccessToBlogAndPost(blogId, postId, req.user.login);

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
    await this.checkAccessToBlogAndPost(blogId, postId, req.user.login);

    const isDeleted = await this.commandBus.execute(new DeleteOnePostCommand(postId));

    if (!isDeleted) {
      throw new NotFoundException({});
    }

    return true;
  }
}
