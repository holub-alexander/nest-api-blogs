import { BadRequestException, Injectable } from '@nestjs/common';
import { UserViewModel } from './interfaces';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersQueryRepository } from './repositories/users.query.repository';
import { User, UserDocument } from '../../entity/user.entity';
import { UsersWriteRepository } from './repositories/users.write.repository';
import { PaginationUsersDto } from './dto/pagination-users.dto';
import { CreateUserDto } from './dto/create.dto';
import { UsersMapper } from '../../common/mappers/users.mapper';
import { Paginator } from '../../common/interfaces';
import bcrypt from 'bcrypt';
import { generateHash } from '../../common/utils/generate-hash';

@Injectable()
export class UsersService {
  // constructor(
  //   @InjectModel(User.name) private readonly UserModel: Model<UserDocument>,
  //   private readonly usersQueryRepository: UsersQueryRepository,
  //   private readonly usersWriteRepository: UsersWriteRepository,
  // ) {}
  //
  // async findAll(queryParams: PaginationUsersDto): Promise<Paginator<UserViewModel[]>> {
  //   const { meta, items } = await this.usersQueryRepository.findAll(queryParams);
  //
  //   return {
  //     ...meta,
  //     items: UsersMapper.mapUsersViewModel(items),
  //   };
  // }
  //
  // async create({ email, password, login }: CreateUserDto): Promise<UserViewModel | null | never> {
  //   const foundUser = await this.usersQueryRepository.findByEmail(email);
  //
  //   if (foundUser) {
  //     throw new BadRequestException([{ field: 'email', message: 'User with this email or login already exists' }]);
  //   }
  //
  //   const passwordSalt = await bcrypt.genSalt(10);
  //   const passwordHash = await generateHash(password, passwordSalt);
  //
  //   const createUserData = new this.UserModel({
  //     accountData: { email, login, password: passwordHash, createdAt: new Date().toISOString() },
  //     emailConfirmation: {
  //       confirmationCode: null,
  //       expirationDate: null,
  //       isConfirmed: true,
  //     },
  //     passwordRecovery: {
  //       recoveryCode: null,
  //     },
  //     refreshTokensMeta: [],
  //   });
  //   const newUser = await this.usersWriteRepository.create(createUserData);
  //
  //   return newUser ? UsersMapper.mapCreatedUserViewModel(newUser) : null;
  // }
}
