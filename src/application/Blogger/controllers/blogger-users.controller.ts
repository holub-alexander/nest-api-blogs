import { SkipThrottle } from '@nestjs/throttler';
import { Body, Controller, Get, HttpCode, Param, Put, Query, Req, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { BanUnbanUserForBlogCommand } from '../../Blogs/handlers/blogger/ban-unban-user-for-blog.handler';
import { BanUserForBlogDto } from '../../Blogs/dto/ban-user.dto';
import { JwtTokenGuard } from '../../Auth/guards/jwt-token.guard';
import { FindAllBannedUsersForBlogCommand } from '../handlers/find-all-banned-users-for-blog.handler';
import { Request } from 'express';
import { PaginationBannedUsersDto } from '../../BannedUserInBlog/dto/pagination-banned-users.dto';

@SkipThrottle()
@Controller('blogger/users')
export class BloggerUsersController {
  constructor(private readonly commandBus: CommandBus) {}

  @Put('/:userId/ban')
  @UseGuards(JwtTokenGuard)
  @HttpCode(204)
  public async banUnbanUserForBlog(
    @Param('userId') userId: string,
    @Body() body: BanUserForBlogDto,
    @Req() req: Request,
  ) {
    return this.commandBus.execute(new BanUnbanUserForBlogCommand(userId, req.user.login, body));
  }

  @Get('/blog/:blogId')
  @UseGuards(JwtTokenGuard)
  public async findAllBannedUsersForBlog(
    @Param('blogId') blogId: string,
    @Query() queryParams: PaginationBannedUsersDto,
    @Req() req: Request,
  ) {
    return this.commandBus.execute(new FindAllBannedUsersForBlogCommand(blogId, req.user.login, queryParams));
  }
}
