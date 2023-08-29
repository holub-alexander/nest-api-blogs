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
import { PaginationBlogDto } from '../../Blogs/dto/pagination-blog.dto';
import { Paginator } from '../../../common/interfaces';
import { BlogViewModel } from '../../Blogs/interfaces';
import { CreateBlogDto } from '../../Blogs/dto/create.dto';
import { CreateBlogCommand } from '../../Blogs/handlers/create-blog.handler';
import { UpdateBlogDto } from '../../Blogs/dto/update.dto';
import { CreatePostFromBlog } from '../../Posts/dto/create.dto';
import { CreatePostCommand } from '../../Posts/handlers/create-post.handler';
import { UpdatePostDto } from '../../Posts/dto/update.dto';
import { UpdatePostCommand } from '../../Posts/handlers/update-post.handler';
import { JwtTokenGuard } from '../../Auth/guards/jwt-token.guard';
import { BlogDocument } from '../../../db/entities/mongoose/blog.entity';
import { PostsQueryRepository } from '../../Posts/repositories/mongoose/posts.query.repository';
import { DeleteOnePostCommand } from '../../Posts/handlers/delete-one-post.handler';
import { UsersQueryRepository } from '../../Users/repositories/mongoose/users.query.repository';
import { FindAllBlogsBloggerCommand } from '../handlers/find-all-blogs.handler';
import { PaginationOptionsDto } from '../../../common/dto/pagination-options.dto';
import { FindAllBloggerCommentsCommand } from '../handlers/find-all-blogger-comments.handler';
import { BlogsTypeOrmQueryRepository } from '../../Blogs/repositories/typeorm/blogs.query.repository';
import BlogEntityTypeOrm from '../../../db/entities/typeorm/blog.entity';
import { BlogsTypeOrmWriteRepository } from '../../Blogs/repositories/typeorm/blogs.write.repository';
import { FindAllBlogsCommand } from '../../Blogs/handlers/find-all-blogs.handler';
import { PostViewModel } from '../../Posts/interfaces';
import { PostsTypeOrmQueryRepository } from '../../Posts/repositories/typeorm/posts.query.repository';
import { UsersTypeOrmQueryRepository } from '../../Users/repositories/typeorm/users.query.repository';
import { FindAllPostsByBlogIdCommand } from '../../Posts/handlers/find-all-posts-for-blog.handler';

@SkipThrottle()
@Controller('blogger/blogs')
export class BloggerBlogsController {
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

    if (foundBlog[0].user_login !== userLogin) {
      throw new ForbiddenException();
    }

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

    if (foundBlog[0].user_login !== userLogin || foundPost[0].blog_id !== foundBlog[0].id) {
      throw new ForbiddenException();
    }

    return foundBlog[0];
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
  public async findAll(
    @Query() queryParams: PaginationBlogDto,
    @Req() req: Request,
  ): Promise<Paginator<BlogViewModel[]>> {
    return this.commandBus.execute(new FindAllBlogsBloggerCommand(queryParams, req.user.login));
  }

  @Get('/:id/posts')
  @UseGuards(JwtTokenGuard)
  public async findAllPosts(
    @Req() req: Request,
    @Param('id') id: string,
    @Query() queryParams: PaginationBlogDto,
  ): Promise<Paginator<PostViewModel[]>> {
    await this.checkAccessToBlog(id, req.user.login);

    return this.commandBus.execute(new FindAllPostsByBlogIdCommand(queryParams, id));
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

    if (!user) {
      throw new NotFoundException();
    }

    return this.commandBus.execute(new CreatePostCommand(body, findBlog.id, user.id));
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
  //
  // @Get('/comments')
  // @UseGuards(JwtTokenGuard)
  // public async findAllBloggerComments(@Query() queryParams: PaginationOptionsDto, @Req() req: Request) {
  //   return this.commandBus.execute(new FindAllBloggerCommentsCommand(queryParams, req.user.login));
  // }
}
