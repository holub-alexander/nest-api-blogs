import { Body, Controller, Delete, Get, HttpCode, Param, Post, Query } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { BasicAuthGuard } from '../../Auth/guards/basic-auth.guard';
import { PaginationUsersDto } from '../../Users/dto/pagination-users.dto';
import { CreateUserDto } from '../../Users/dto/create.dto';
import { CommandBus } from '@nestjs/cqrs';
import { FindAllUsersCommand } from '../../Users/handlers/find-all-users.handler';
import { CreateUserCommand } from '../../Users/handlers/create-user.handler';
import { DeleteUserCommand } from '../../Users/handlers/delete-user.handler';

@SkipThrottle()
@Controller('/sa/users')
export class SuperAdminUsersController {
  constructor(private commandBus: CommandBus) {}

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
