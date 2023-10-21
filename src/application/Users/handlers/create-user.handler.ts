import { CreateUserDto } from '../dto/create.dto';
import { CommandHandler } from '@nestjs/cqrs';
import { UserViewModel } from '../interfaces';
import { BadRequestException } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { generateHash } from '../../../common/utils/generate-hash';
import { UsersMapper } from '../mappers/users.mapper';
import UserEntityTypeOrm from '../../../db/entities/typeorm/user.entity';
import { UsersQueryRepository } from '../repositories/users.query.repository';
import { UsersWriteRepository } from '../repositories/users.write.repository';

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
    createUserData.created_at = new Date();
    createUserData.confirmation_code = null;
    createUserData.expiration_date = null;
    createUserData.is_confirmed = true;
    createUserData.recovery_code = null;

    const newUser = await this.usersWriteRepository.create(createUserData);

    return newUser ? UsersMapper.mapCreatedUserViewModel(newUser) : null;
  }
}
