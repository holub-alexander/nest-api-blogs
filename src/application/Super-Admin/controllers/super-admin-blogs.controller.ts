import {
  Body,
  Controller,
  Delete,
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
import { PaginationBlogDto } from '../../Blogs/dto/pagination-blog.dto';
import { Paginator } from '../../../common/interfaces';
import { UpdateBlogDto } from '../../Blogs/dto/update.dto';
import { CreatePostFromBlog } from '../../Posts/dto/create.dto';
import { CreatePostCommand } from '../../Posts/handlers/create-post.handler';
import { UpdatePostDto } from '../../Posts/dto/update.dto';
import { UpdatePostCommand } from '../../Posts/handlers/update-post.handler';
import { DeleteOnePostCommand } from '../../Posts/handlers/delete-one-post.handler';
import { BlogsTypeOrmQueryRepository } from '../../Blogs/repositories/typeorm/blogs.query.repository';
import BlogEntityTypeOrm from '../../../db/entities/typeorm/blog.entity';
import { BlogsTypeOrmWriteRepository } from '../../Blogs/repositories/typeorm/blogs.write.repository';
import { PostViewModel } from '../../Posts/interfaces';
import { PostsTypeOrmQueryRepository } from '../../Posts/repositories/typeorm/posts.query.repository';
import { UsersTypeOrmQueryRepository } from '../../Users/repositories/typeorm/users.query.repository';
import { FindAllPostsByBlogIdCommand } from '../../Posts/handlers/find-all-posts-for-blog.handler';
import { BasicAuthGuard } from '../../Auth/guards/basic-auth.guard';
import { BlogViewModelSuperAdmin } from '../../Blogs/interfaces';
import { FindAllBlogsSuperAdminCommand } from '../handlers/find-all-blogs.handler';
import { CreateBlogDto } from '../../Blogs/dto/create.dto';
import { CreateBlogSuperAdminCommand } from '../handlers/create-blog-super-admin.handler';

@SkipThrottle()
@Controller('sa/blogs')
export class SuperAdminBlogsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly blogsWriteRepository: BlogsTypeOrmWriteRepository,
    private readonly blogsQueryRepository: BlogsTypeOrmQueryRepository,
    private readonly postsQueryRepository: PostsTypeOrmQueryRepository,
    private readonly usersQueryRepository: UsersTypeOrmQueryRepository,
  ) {}

  private async checkAccessToBlog(blogId: string, userLogin: string): Promise<BlogEntityTypeOrm | never> {
    const foundBlog = await this.blogsQueryRepository.findOne(blogId);

    if (!foundBlog || foundBlog.length === 0) {
      throw new NotFoundException({});
    }

    // if (foundBlog[0].user_login !== userLogin) {
    //   throw new ForbiddenException();
    // }

    return foundBlog[0];
  }

  private async checkAccessToBlogAndPost(
    blogId: string,
    postId: string,
    userLogin: string,
  ): Promise<BlogEntityTypeOrm | never> {
    const foundBlog = await this.blogsQueryRepository.findOne(blogId);
    const foundPost = await this.postsQueryRepository.findOne(postId);

    if (!foundBlog || foundBlog.length === 0 || !foundPost || foundPost.length === 0) {
      throw new NotFoundException({});
    }

    // if (foundBlog[0].user_login !== userLogin || foundPost[0].blog_id !== foundBlog[0].id) {
    //   throw new ForbiddenException();
    // }

    return foundBlog[0];
  }

  @Get()
  @UseGuards(BasicAuthGuard)
  public async findAll(@Query() queryParams: PaginationBlogDto): Promise<Paginator<BlogViewModelSuperAdmin[]>> {
    return this.commandBus.execute(new FindAllBlogsSuperAdminCommand(queryParams));
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  @HttpCode(201)
  public async create(@Body() body: CreateBlogDto) {
    return this.commandBus.execute(new CreateBlogSuperAdminCommand(body));
  }

  @Put('/:id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  public async updateOne(@Param('id') id: string, @Body() body: UpdateBlogDto, @Req() req: Request) {
    // await this.checkAccessToBlog(id, req.user.login);

    const isUpdated = await this.blogsWriteRepository.updateOne(id, body);

    if (!isUpdated) {
      throw new NotFoundException({});
    }

    return true;
  }

  @Delete('/:id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  public async deleteOne(@Param('id') id: string, @Req() req: Request) {
    // await this.checkAccessToBlog(id, req.user.login);

    const isDeleted = await this.blogsWriteRepository.deleteOne(id);

    if (!isDeleted) {
      throw new NotFoundException({});
    }

    return true;
  }

  @Get('/:id/posts')
  @UseGuards(BasicAuthGuard)
  public async findAllPosts(
    @Req() req: Request,
    @Param('id') id: string,
    @Query() queryParams: PaginationBlogDto,
  ): Promise<Paginator<PostViewModel[]>> {
    // await this.checkAccessToBlog(id, req.user.login);

    return this.commandBus.execute(new FindAllPostsByBlogIdCommand(queryParams, id));
  }

  @Post('/:id/posts')
  @UseGuards(BasicAuthGuard)
  @HttpCode(201)
  public async createPostForCurrentBlog(
    @Param('id') id: string,
    @Body() body: CreatePostFromBlog,
    @Req() req: Request,
  ) {
    // const findBlog = await this.checkAccessToBlog(id, req.user.login);

    const foundBlog = await this.blogsQueryRepository.findOne(id);

    if (!foundBlog || foundBlog.length === 0) {
      throw new NotFoundException({});
    }

    return this.commandBus.execute(new CreatePostCommand(body, foundBlog[0].id));
  }

  @Put('/:blogId/posts/:postId')
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  public async updateOnePost(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
    @Body() body: UpdatePostDto,
    @Req() req: Request,
  ) {
    // await this.checkAccessToBlogAndPost(blogId, postId, req.user.login);

    const foundBlog = await this.blogsQueryRepository.findOne(blogId);

    if (!foundBlog || foundBlog.length === 0) {
      throw new NotFoundException({});
    }

    const isUpdated = await this.commandBus.execute(new UpdatePostCommand(postId, body));

    if (!isUpdated) {
      throw new NotFoundException({});
    }

    return true;
  }

  @Delete('/:blogId/posts/:postId')
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  public async deleteOnePost(@Param('blogId') blogId: string, @Param('postId') postId: string, @Req() req: Request) {
    // await this.checkAccessToBlogAndPost(blogId, postId, req.user.login);

    const foundBlog = await this.blogsQueryRepository.findOne(blogId);

    if (!foundBlog || foundBlog.length === 0) {
      throw new NotFoundException({});
    }

    const isDeleted = await this.commandBus.execute(new DeleteOnePostCommand(postId));

    if (!isDeleted) {
      throw new NotFoundException({});
    }

    return true;
  }

  //
  // @Get('/comments')
  // @UseGuards(JwtTokenGuard)
  // public async findAllBloggerComments(@Query() queryParams: PaginationOptionsDto, @Req() req: Request) {
  //   return this.commandBus.execute(new FindAllBloggerCommentsCommand(queryParams, req.user.login));
  // }
}
