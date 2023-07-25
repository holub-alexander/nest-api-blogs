import { CreateUserDto } from '../dto/create.dto';
import { CommandHandler } from '@nestjs/cqrs';
import { UserViewModel } from '../interfaces';
import { BadRequestException } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { generateHash } from '../../../common/utils/generate-hash';
import { UsersMapper } from '../mappers/users.mapper';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../../db/entities/mongoose/user.entity';
import { Model } from 'mongoose';
import { UsersQueryRepository } from '../repositories/mongoose/users.query.repository';
import { UsersWriteRepository } from '../repositories/mongoose/users.write.repository';
import UserEntityTypeOrm from '../../../db/entities/typeorm/user.entity';

export class CreateUserCommand {
  constructor(public body: CreateUserDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserHandler {
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly usersWriteRepository: UsersWriteRepository,
  ) {}

  public async execute(command: CreateUserCommand): Promise<UserViewModel | null | never> {
    const { email, password, login } = command.body;
    const foundUser = await this.usersQueryRepository.findByEmail(email);

    if (foundUser) {
      throw new BadRequestException([{ field: 'email', message: 'User with this email or login already exists' }]);
    }

    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await generateHash(password, passwordSalt);

    const createUserData = new UserEntityTypeOrm();

    createUserData.email = email;
    createUserData.login = login;
    createUserData.password = passwordHash;
    createUserData.created_at = new Date().toISOString();
    createUserData.is_banned = false;
    createUserData.ban_reason = null;
    createUserData.ban_date = null;
    createUserData.confirmation_code = null;
    createUserData.expiration_date = null;
    createUserData.is_confirmed = true;
    createUserData.recovery_code = null;

    // const createUserData = new this.UserModel<User>({
    //   accountData: {
    //     email,
    //     login,
    //     password: passwordHash,
    //     createdAt: new Date().toISOString(),
    //     isBanned: false,
    //     banReason: null,
    //     banDate: null,
    //   },
    //   emailConfirmation: {
    //     confirmationCode: null,
    //     expirationDate: null,
    //     isConfirmed: true,
    //   },
    //   passwordRecovery: {
    //     recoveryCode: null,
    //   },
    //   refreshTokensMeta: [],
    // });

    const newUser = await this.usersWriteRepository.create(createUserData);

    return newUser ? UsersMapper.mapCreatedUserViewModel(newUser) : null;
  }
}
