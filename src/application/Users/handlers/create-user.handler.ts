import { CreateUserDto } from '../dto/create.dto';
import { CommandHandler } from '@nestjs/cqrs';
import { UserViewModel } from '../interfaces';
import { BadRequestException } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { generateHash } from '../../../common/utils/generate-hash';
import { UsersMapper } from '../../../common/mappers/users.mapper';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../../entity/user.entity';
import { Model } from 'mongoose';
import { UsersQueryRepository } from '../repositories/users.query.repository';
import { UsersWriteRepository } from '../repositories/users.write.repository';

export class CreateUserCommand {
  constructor(public body: CreateUserDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserHandler {
  constructor(
    @InjectModel(User.name) private readonly UserModel: Model<UserDocument>,
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

    const createUserData = new this.UserModel<User>({
      accountData: {
        email,
        login,
        password: passwordHash,
        createdAt: new Date().toISOString(),
        isBanned: false,
        banReason: null,
      },
      emailConfirmation: {
        confirmationCode: null,
        expirationDate: null,
        isConfirmed: true,
      },
      passwordRecovery: {
        recoveryCode: null,
      },
      refreshTokensMeta: [],
    });
    const newUser = await this.usersWriteRepository.create(createUserData);

    return newUser ? UsersMapper.mapCreatedUserViewModel(newUser) : null;
  }
}
