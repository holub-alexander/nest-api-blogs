import { Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Post, Put, Query } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { BasicAuthGuard } from '../../Auth/guards/basic-auth.guard';
import { PaginationUsersDto } from '../../Users/dto/pagination-users.dto';
import { CreateUserDto } from '../../Users/dto/create.dto';
import { CommandBus } from '@nestjs/cqrs';
import { FindAllUsersCommand } from '../../Users/handlers/find-all-users.handler';
import { CreateUserCommand } from '../../Users/handlers/create-user.handler';
import { DeleteUserCommand } from '../../Users/handlers/delete-user.handler';
import { BanUnbanUserDto } from '../../Users/dto/ban-unban.dto';
import { BanUnbanUserCommand } from '../../Users/handlers/ban-unban-user.handler';
import { FindOneUserCommand } from '../../Users/handlers/find-one-user.handler';

@SkipThrottle()
@Controller('/sa/users')
export class SuperAdminUsersController {
  constructor(private commandBus: CommandBus) {}

  @Put('/:id/ban')
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  public async banUnbanUser(@Param('id') id: string, @Body() body: BanUnbanUserDto) {
    const user = await this.commandBus.execute(new FindOneUserCommand(id));

    if (!user) {
      throw new NotFoundException();
    }

    await this.commandBus.execute(new BanUnbanUserCommand(user.id, body.isBanned, body.banReason, new Date()));

    return true;
  }

  @Get()
  @UseGuards(BasicAuthGuard)
  public async findAll(@Query() queryParams: PaginationUsersDto) {
    return this.commandBus.execute(new FindAllUsersCommand(queryParams));
  }

  @Post()
  @HttpCode(201)
  @UseGuards(BasicAuthGuard)
  public async createUser(@Body() body: CreateUserDto) {
    return this.commandBus.execute(new CreateUserCommand(body));
  }

  @Delete('/:id')
  @HttpCode(204)
  @UseGuards(BasicAuthGuard)
  public async deleteUserHandler(@Param('id') id: string) {
    return this.commandBus.execute(new DeleteUserCommand(id));
  }
}
