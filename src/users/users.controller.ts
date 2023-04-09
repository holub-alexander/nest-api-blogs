import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common';

import { UsersService } from '@/users/users.service';
import { UsersWriteRepository } from '@/users/repositories/users.write.repository';
import { PaginationUsersDto } from '@/users/dto/pagination-users.dto';
import { CreateUserDto } from '@/users/dto/create.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersWriteRepository: UsersWriteRepository,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  findAll(@Query() queryParams: PaginationUsersDto) {
    return this.usersService.findAll(queryParams);
  }

  @Post()
  @HttpCode(201)
  createUser(@Body() body: CreateUserDto) {
    if (body.login) {
      throw new BadRequestException([{ message: 'Bad blogger', field: 'bloggerId' }]);
    }

    return this.usersService.create(body);
  }

  @Delete('/:id')
  @HttpCode(204)
  async deleteUserHandler(@Param('id') id: string) {
    const res = await this.usersWriteRepository.deleteOne(id);

    if (!res) {
      throw new NotFoundException({});
    }

    return res;
  }
}
