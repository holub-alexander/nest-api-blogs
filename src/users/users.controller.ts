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
  UseGuards,
} from '@nestjs/common';
import { PaginationAndSortQueryParams, SortDirections } from '../@types';
import { UserInputModel } from './@types';
import { AuthGuard } from '@/common/guards/auth.guard';
import { UsersService } from '@/users/users.service';
import { UsersWriteRepository } from '@/users/repositories/users.write.repository';

export type UsersQueryParams = PaginationAndSortQueryParams & { searchLoginTerm?: string; searchEmailTerm?: string };

@UseGuards(AuthGuard)
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
