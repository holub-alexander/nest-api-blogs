import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../Mail/mail.service';
import { add } from 'date-fns';
import { AuthMapper } from '../../common/mappers/typeorm/auth.mapper';
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
import config from '../../config/config';
import UserEntityTypeOrm from '../../db/entities/typeorm/user.entity';
import { UsersTypeOrmQueryRepository } from '../Users/repositories/typeorm/users.query.repository';
import { UsersTypeOrmWriteRepository } from '../Users/repositories/typeorm/users.write.repository';
import { SecurityDevicesTypeOrmWriteRepository } from '../Security-Devices/repositories/typeorm/security-devices.write.repository';
import { SecurityDevicesTypeOrmQueryRepository } from '../Security-Devices/repositories/typeorm/security-devices.query.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersQueryRepository: UsersTypeOrmQueryRepository,
    private readonly usersWriteRepository: UsersTypeOrmWriteRepository,
    private readonly securityDevicesWriteRepository: SecurityDevicesTypeOrmWriteRepository,
    private readonly securityDevicesQueryRepository: SecurityDevicesTypeOrmQueryRepository,
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

    if (!isCorrectCredentials || !user || user.is_banned) {
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

  public async register(body: CreateUserDto): Promise<UserEntityTypeOrm | null> {
    const findUserByLogin = await this.usersQueryRepository.findByLogin(body.login);
    const findUserByEmail = await this.usersQueryRepository.findByEmail(body.email);

    if (findUserByLogin) {
      throw new BadRequestException([{ message: 'User with this login already exists', field: 'login' }]);
    }

    if (findUserByEmail) {
      throw new BadRequestException([{ message: 'User with this email already exists', field: 'email' }]);
    }

    const passwordHash = await getPasswordHash(body.password);

    const userData = new UserEntityTypeOrm();

    userData.login = body.login;
    userData.email = body.email;
    userData.password = passwordHash;
    userData.created_at = new Date();
    userData.is_banned = false;
    userData.ban_reason = null;
    userData.ban_date = null;
    userData.confirmation_code = uuidv4();
    userData.expiration_date = add(new Date(), {
      hours: 1,
    });
    userData.is_confirmed = false;
    userData.recovery_code = null;

    // const userData = new this.UserModel<User>({
    //   accountData: {
    //     login: body.login,
    //     email: body.email,
    //     password: passwordHash,
    //     createdAt: new Date().toISOString(),
    //     isBanned: false,
    //     banReason: null,
    //     banDate: null,
    //   },
    //   emailConfirmation: {
    //     confirmationCode: uuidv4(),
    //     expirationDate: add(new Date(), {
    //       hours: 1,
    //     }),
    //     isConfirmed: false,
    //   },
    //   passwordRecovery: {
    //     recoveryCode: null,
    //   },
    //   refreshTokensMeta: [],
    // });

    const createdUser = await this.usersWriteRepository.create(userData);

    if (createdUser) {
      await this.mailService.sendConfirmationCodeEmail(createdUser.email, createdUser.confirmation_code ?? '');
    }

    return createdUser;
  }

  public async confirmRegistration(body: ConfirmRegistrationInputDto): Promise<boolean> {
    const findUser = await this.usersQueryRepository.findByConfirmationCode(body.code);

    if (!findUser) return false;
    if (findUser.is_confirmed) return false;
    if (findUser.confirmation_code !== body.code) return false;
    if (findUser.expiration_date && findUser.expiration_date <= new Date()) return false;

    return await this.usersWriteRepository.confirmRegistration(findUser.id);
  }

  public async registrationEmailResending(body: RegistrationEmailResendingInputDto) {
    const user = await this.usersQueryRepository.findByLoginOrEmail(body.email);

    if (!user || user.is_confirmed) {
      return false;
    }

    const newConfirmationCode = {
      confirmationCode: uuidv4(),
      expirationDate: add(new Date(), {
        hours: 1,
      }),
    };

    const isUpdateConfirmationCode = await this.usersWriteRepository.updateConfirmationCode(
      user.id,
      newConfirmationCode,
    );

    if (isUpdateConfirmationCode) {
      await this.mailService.sendConfirmationCodeEmail(user.email, newConfirmationCode.confirmationCode);

      return true;
    }
  }

  public async updateTokens(
    refreshTokenPayload: UserRefreshTokenPayload,
  ): Promise<null | { accessToken: string; refreshToken: string }> {
    const foundDevice = await this.securityDevicesQueryRepository.findDeviceById(refreshTokenPayload.deviceId);
    const foundUser = await this.usersQueryRepository.findUserById(foundDevice.user_id.toString());

    if (!foundDevice || !foundUser) {
      return null;
    }

    const newRefreshToken = await this.securityDevicesService.updateDeviceRefreshToken({
      login: foundUser.login,
      iat: refreshTokenPayload.iat,
      deviceId: refreshTokenPayload.deviceId,
    });

    if (!newRefreshToken) {
      return null;
    }

    const accessToken = this.jwtService.sign(
      { login: foundUser.login },
      { secret: process.env.ACCESS_TOKEN_PRIVATE_KEY as string, expiresIn: config.accessTokenExpiration },
    );

    return { accessToken, refreshToken: newRefreshToken };
  }

  public async logout(refreshTokenPayload: UserRefreshTokenPayload): Promise<boolean> {
    return this.securityDevicesWriteRepository.deleteDeviceSessionById(refreshTokenPayload.deviceId);
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

    if (!user) {
      return false;
    }

    await this.mailService.sendPasswordRecoveryEmail(body.email, recoveryCode);
    await this.usersWriteRepository.passwordRecovery(user.id, recoveryCode);

    return true;
  }

  public async confirmPasswordRecovery(body: NewPasswordRecoveryInputDto): Promise<boolean> {
    const passwordHash = await getPasswordHash(body.newPassword);

    return this.usersWriteRepository.confirmPasswordRecovery({ recoveryCode: body.recoveryCode, passwordHash });
  }
}
