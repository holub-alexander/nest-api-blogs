import { SkipThrottle } from '@nestjs/throttler';
import { Body, Controller, Get, HttpCode, NotFoundException, Param, Put, Query, Req, UseGuards } from '@nestjs/common';
import { BanUserForBlogDto } from '../../Blogs/dto/ban-user.dto';
import { CommandBus } from '@nestjs/cqrs';
import { BanUnbanUserForBlogCommand } from '../handlers/ban-unban-user-for-blog.handler';
import { FindOneUserCommand } from '../../Users/handlers/find-one-user.handler';
import { JwtTokenGuard } from '../../Auth/guards/jwt-token.guard';
import { Request } from 'express';
import { PaginationBannedUsersDto } from '../dto/pagination-banned-users.dto';
import { FindAllBannedUsersForBlogCommand } from '../handlers/find-all-banned-users-for-blog.handler';
import { BlogsTypeOrmQueryRepository } from '../../Blogs/repositories/typeorm/blogs.query.repository';
import BlogEntityTypeOrm from '../../../db/entities/typeorm/blog.entity';

@SkipThrottle()
@Controller('blogger/users')
export class BloggerUsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly blogsQueryRepository: BlogsTypeOrmQueryRepository,
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

  @Put('/:userId/ban')
  @UseGuards(JwtTokenGuard)
  @HttpCode(204)
  public async banUnbanUserForBlog(
    @Param('userId') userId: string,
    @Body() body: BanUserForBlogDto,
    @Req() req: Request,
  ) {
    const user = await this.commandBus.execute(new FindOneUserCommand(userId));

    if (!user || user.length === 0) {
      throw new NotFoundException();
    }

    const foundBlog = await this.checkAccessToBlog(body.blogId, req.user.login);

    if (!foundBlog) {
      throw new NotFoundException();
    }

    return this.commandBus.execute(new BanUnbanUserForBlogCommand(user.id, foundBlog.id, user.login, body));
  }

  @Get('/blog/:blogId')
  @UseGuards(JwtTokenGuard)
  public async findAllBannedUsersForBlog(
    @Param('blogId') blogId: string,
    @Query() queryParams: PaginationBannedUsersDto,
    @Req() req: Request,
  ) {
    const foundBlog = await this.checkAccessToBlog(blogId, req.user.login);

    if (!foundBlog) {
      throw new NotFoundException();
    }

    return this.commandBus.execute(new FindAllBannedUsersForBlogCommand(foundBlog.id, queryParams));
  }
}
