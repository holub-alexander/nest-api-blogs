// @ts-nocheck

import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../Mail/mail.service';
import { add } from 'date-fns';
import { UsersQueryRepository } from '../Users/repositories/mongoose/users.query.repository';
import { User, UserDocument } from '../../db/entities/mongoose/user.entity';
import { AuthMapper } from '../../common/mappers/auth.mapper';
import { UsersWriteRepository } from '../Users/repositories/mongoose/users.write.repository';
import { getPasswordHash } from '../../common/utils/get-password-hash';
import { UserRefreshTokenPayload } from './interfaces';
import {
  ConfirmRegistrationInputDto,
  LoginInputDto,
  NewPasswordRecoveryInputDto,
  PasswordRecoveryInputDto,
  RegistrationEmailResendingInputDto,
} from './dto/create.dto';
import { SecurityDevicesService } from '../Security-Devices/security-devices.service';
import { CreateUserDto } from '../Users/dto/create.dto';
import { SecurityDevicesWriteRepository } from '../Security-Devices/repositories/security-devices.write.repository';
import config from '../../config/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly UserModel: Model<UserDocument>,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly usersWriteRepository: UsersWriteRepository,
    private readonly securityDevicesWriteRepository: SecurityDevicesWriteRepository,
    private readonly securityDevicesService: SecurityDevicesService,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
  ) {}

  public async checkCredentials(body: LoginInputDto): Promise<boolean> {
    const user = await this.usersQueryRepository.findByLoginOrEmail(body.loginOrEmail);

    if (!user) {
      return false;
    }

    return bcrypt.compare(body.password, user.password);
  }

  public async me(loginOrEmail = '') {
    const user = await this.usersQueryRepository.findByLoginOrEmail(loginOrEmail);

    if (!user) return false;

    return AuthMapper.mapMeViewModel(user);
  }

  public async login(
    body: LoginInputDto,
    ip: string,
    userAgent?: string,
  ): Promise<{ refreshToken: string; accessToken: string } | null> {
    const user = await this.usersQueryRepository.findByLoginOrEmail(body.loginOrEmail);
    const isCorrectCredentials = await this.checkCredentials(body);

    if (!isCorrectCredentials || !user || user.isBanned) {
      return null;
    }

    const addedSecurityDevice = await this.securityDevicesService.create({
      userId: user.id,
      userAgent,
      ip,
    });

    if (!addedSecurityDevice) {
      return null;
    }

    const accessToken = this.jwtService.sign(
      { login: user.login },
      { secret: process.env.ACCESS_TOKEN_PRIVATE_KEY as string, expiresIn: config.accessTokenExpiration },
    );

    const refreshToken = this.jwtService.sign(
      {
        login: user.login,
        deviceId: addedSecurityDevice.deviceId,
        iat: Math.round(addedSecurityDevice.issuedAt.valueOf() / 1000),
      },
      { secret: process.env.REFRESH_TOKEN_PRIVATE_KEY as string, expiresIn: config.refreshTokenExpiration },
    );

    return { refreshToken, accessToken };
  }

  public async register(body: CreateUserDto): Promise<UserDocument | null> {
    const findUserByLogin = await this.usersQueryRepository.findByLogin(body.login);
    const findUserByEmail = await this.usersQueryRepository.findByEmail(body.email);

    console.log(findUserByLogin, findUserByEmail);

    if (findUserByLogin) {
      throw new BadRequestException([{ message: 'User with this login already exists', field: 'login' }]);
    }

    if (findUserByEmail) {
      throw new BadRequestException([{ message: 'User with this email already exists', field: 'email' }]);
    }

    const passwordHash = await getPasswordHash(body.password);
    const userData = new this.UserModel<User>({
      accountData: {
        login: body.login,
        email: body.email,
        password: passwordHash,
        createdAt: new Date().toISOString(),
        isBanned: false,
        banReason: null,
        banDate: null,
      },
      emailConfirmation: {
        confirmationCode: uuidv4(),
        expirationDate: add(new Date(), {
          hours: 1,
        }),
        isConfirmed: false,
      },
      passwordRecovery: {
        recoveryCode: null,
      },
      refreshTokensMeta: [],
    });

    const createdUser = await this.usersWriteRepository.create(userData);

    if (createdUser) {
      await this.mailService.sendConfirmationCodeEmail(
        createdUser.accountData.email,
        createdUser.emailConfirmation.confirmationCode ?? '',
      );
    }

    return createdUser;
  }

  public async confirmRegistration(body: ConfirmRegistrationInputDto): Promise<boolean> {
    const findUser = await this.usersQueryRepository.findByConfirmationCode(body.code);

    if (!findUser) return false;
    if (findUser.emailConfirmation.isConfirmed) return false;
    if (findUser.emailConfirmation.confirmationCode !== body.code) return false;
    if (findUser.emailConfirmation.expirationDate && findUser.emailConfirmation.expirationDate <= new Date())
      return false;

    return await this.usersWriteRepository.confirmRegistration(findUser._id);
  }

  public async registrationEmailResending(body: RegistrationEmailResendingInputDto) {
    const user = await this.usersQueryRepository.findByLoginOrEmail(body.email);

    if (!user || user.emailConfirmation.isConfirmed) {
      return false;
    }

    const newConfirmationCode = {
      confirmationCode: uuidv4(),
      expirationDate: add(new Date(), {
        hours: 1,
      }),
    };

    const isUpdateConfirmationCode = await this.usersWriteRepository.updateConfirmationCode(
      user._id,
      newConfirmationCode,
    );

    if (isUpdateConfirmationCode) {
      await this.mailService.sendConfirmationCodeEmail(user.accountData.email, newConfirmationCode.confirmationCode);

      return true;
    }
  }

  public async updateTokens(
    refreshTokenPayload: UserRefreshTokenPayload,
  ): Promise<null | { accessToken: string; refreshToken: string }> {
    const user = await this.usersQueryRepository.findByDeviceId(
      refreshTokenPayload.login,
      refreshTokenPayload.deviceId,
    );

    if (!user) {
      return null;
    }

    const newRefreshToken = await this.securityDevicesService.updateDeviceRefreshToken({
      login: user.accountData.login,
      iat: refreshTokenPayload.iat,
      deviceId: refreshTokenPayload.deviceId,
    });

    if (!newRefreshToken) {
      return null;
    }

    const accessToken = this.jwtService.sign(
      { login: user.accountData.login },
      { secret: process.env.ACCESS_TOKEN_PRIVATE_KEY as string, expiresIn: config.accessTokenExpiration },
    );

    return { accessToken, refreshToken: newRefreshToken };
  }

  public async logout(refreshTokenPayload: UserRefreshTokenPayload): Promise<boolean> {
    return this.securityDevicesWriteRepository.deleteDeviceSessionById(
      refreshTokenPayload.login,
      refreshTokenPayload.deviceId,
    );
  }

  public async verifyPasswordRecoveryJwtToken(recoveryCode: string) {
    if (!recoveryCode) {
      return false;
    }

    try {
      await this.jwtService.verify(recoveryCode, { secret: process.env.PASSWORD_RECOVERY_PRIVATE_KEY as string });

      return true;
    } catch (err) {
      return false;
    }
  }

  public async passwordRecovery(body: PasswordRecoveryInputDto): Promise<boolean> {
    const recoveryCode = this.jwtService.sign(
      { email: body.email },
      { secret: process.env.PASSWORD_RECOVERY_PRIVATE_KEY as string, expiresIn: '1h' },
    );
    const user = await this.usersQueryRepository.findByEmail(body.email);

    await this.mailService.sendPasswordRecoveryEmail(body.email, recoveryCode);

    if (!user) {
      return true;
    }

    await this.usersWriteRepository.passwordRecovery(user._id, recoveryCode);

    return true;
  }

  public async confirmPasswordRecovery(body: NewPasswordRecoveryInputDto): Promise<boolean> {
    const passwordHash = await getPasswordHash(body.newPassword);

    return this.usersWriteRepository.confirmPasswordRecovery({ recoveryCode: body.recoveryCode, passwordHash });
  }
}
