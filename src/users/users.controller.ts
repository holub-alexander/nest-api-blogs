import { Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Post, Query } from '@nestjs/common';
import { UsersWriteRepository } from './repositories/users.write.repository';
import { UsersService } from './users.service';
import { PaginationAndSortQueryParams, SortDirections } from '../@types';
import { UserInputModel } from './@types';

export type UsersQueryParams = PaginationAndSortQueryParams & { searchLoginTerm?: string; searchEmailTerm?: string };

@Controller('users')
export class UsersController {
  constructor(private usersWriteRepository: UsersWriteRepository, private usersService: UsersService) {}

  @Get()
  findAll(
    @Query('sortBy') sortBy: UsersQueryParams['sortBy'],
    @Query('sortDirection') sortDirection: SortDirections,
    @Query('pageNumber') pageNumber: UsersQueryParams['pageNumber'],
    @Query('pageSize') pageSize: UsersQueryParams['pageSize'],
    @Query('searchLoginTerm') searchLoginTerm?: UsersQueryParams['searchLoginTerm'],
    @Query('searchEmailTerm') searchEmailTerm?: UsersQueryParams['searchEmailTerm'],
  ) {
    return this.usersService.findAll({
      sortBy,
      sortDirection,
      pageNumber,
      pageSize,
      searchLoginTerm,
      searchEmailTerm,
    });
  }

  @Post()
  @HttpCode(201)
  createUser(@Body() body: UserInputModel) {
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
