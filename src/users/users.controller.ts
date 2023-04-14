import { Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Post, Query } from '@nestjs/common';
import { UsersWriteRepository } from './repositories/users.write.repository';
import { UsersService } from './users.service';
import { PaginationUsersDto } from './dto/pagination-users.dto';
import { CreateUserDto } from './dto/create.dto';
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard';
import { UseGuards } from '@nestjs/common';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersWriteRepository: UsersWriteRepository,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  @UseGuards(BasicAuthGuard)
  findAll(@Query() queryParams: PaginationUsersDto) {
    return this.usersService.findAll(queryParams);
  }

  @Post()
  @HttpCode(201)
  @UseGuards(BasicAuthGuard)
  createUser(@Body() body: CreateUserDto) {
    return this.usersService.create(body);
  }

  @Delete('/:id')
  @HttpCode(204)
  @UseGuards(BasicAuthGuard)
  async deleteUserHandler(@Param('id') id: string) {
    const res = await this.usersWriteRepository.deleteOne(id);

    if (!res) {
      throw new NotFoundException({});
    }

    return res;
  }
}
