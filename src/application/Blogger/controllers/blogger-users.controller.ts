import { SkipThrottle } from '@nestjs/throttler';
import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Put,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { BanUserForBlogDto } from '../../Blogs/dto/ban-user.dto';
import { CommandBus } from '@nestjs/cqrs';
import { BanUnbanUserForBlogCommand } from '../handlers/ban-unban-user-for-blog.handler';
import { FindOneUserCommand } from '../../Users/handlers/find-one-user.handler';
import { JwtTokenGuard } from '../../Auth/guards/jwt-token.guard';
import { Request } from 'express';
import { BlogDocument } from '../../../entity/blog.entity';
import { BlogsQueryRepository } from '../../Blogs/repositories/blogs.query.repository';
import { PaginationBannedUsersDto } from '../dto/pagination-banned-users.dto';
import { FindAllBannedUsersForBlogCommand } from '../handlers/find-all-banned-users-for-blog.handler';

@SkipThrottle()
@Controller('blogger/users')
export class BloggerUsersController {
  constructor(private readonly commandBus: CommandBus, private readonly blogsQueryRepository: BlogsQueryRepository) {}

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

  @Put('/:userId/ban')
  @UseGuards(JwtTokenGuard)
  @HttpCode(204)
  public async banUnbanUserForBlog(
    @Param('userId') userId: string,
    @Body() body: BanUserForBlogDto,
    @Req() req: Request,
  ) {
    const user = await this.commandBus.execute(new FindOneUserCommand(userId));

    if (!user) {
      throw new UnauthorizedException();
    }

    const foundBlog = await this.checkAccessToBlog(body.blogId, req.user.login);
    const res = await this.commandBus.execute(
      new BanUnbanUserForBlogCommand(user._id, foundBlog._id, user.accountData.login, body),
    );

    if (!res) {
      throw new NotFoundException();
    }

    return true;
  }

  @Get('/blog/:blogId')
  @UseGuards(JwtTokenGuard)
  public async findAllBannedUsersForBlog(
    @Param('blogId') blogId: string,
    @Query() queryParams: PaginationBannedUsersDto,
  ) {
    const foundBlog = await this.blogsQueryRepository.findOne(blogId);

    if (!foundBlog) {
      throw new NotFoundException();
    }

    return this.commandBus.execute(new FindAllBannedUsersForBlogCommand(foundBlog._id, queryParams));
  }
}
