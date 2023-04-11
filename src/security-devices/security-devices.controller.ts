import { Request, Response } from 'express';
import { constants } from 'http2';
import { Controller, Delete, Get, UnauthorizedException } from '@nestjs/common';
import { UsersQueryRepository } from '@/users/repositories/users.query.repository';
import { SecurityDevicesQueryRepository } from '@/security-devices/repositories/security-devices.query.repository';
import { SecurityDevicesWriteRepository } from '@/security-devices/repositories/security-devices.write.repository';
import { SecurityMapper } from '@/common/mappers/security-devices.mapper';
import { DeviceViewModel } from '@/security-devices/interfaces';

/* TODO: Edit this module */

@Controller('security/devices')
export class SecurityDevicesController {
  constructor(
    private readonly securityQueryRepository: SecurityDevicesQueryRepository,
    private readonly securityWriteRepository: SecurityDevicesWriteRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  @Get()
  public async findAllSessions(): Promise<DeviceViewModel[]> {
    // @ts-ignore
    const user = await this.usersQueryRepository.getUserByLogin(req.userRefreshTokenPayload.login);

    if (!user) {
      throw new UnauthorizedException();
    }

    // @ts-ignore
    return SecurityMapper.getAllDevicesForUser(user.refreshTokensMeta);
  }

  @Delete()
  public async deleteAllSessions() {
    const user = await this.usersQueryRepository.findByDeviceId(
      // @ts-ignore
      req.userRefreshTokenPayload.login,
      // @ts-ignore
      req.userRefreshTokenPayload.deviceId,
    );

    if (!user) {
      throw new UnauthorizedException();
    }

    const data = await this.securityWriteRepository.deleteAllDeviceSessions(
      user._id,
      // @ts-ignore
      req.userRefreshTokenPayload.deviceId,
    );

    console.log(data);
    // @ts-ignore
    res.sendStatus(constants.HTTP_STATUS_NO_CONTENT);
  }

  @Delete('/:deviceId')
  public async deleteSessionById(req: Request<{ deviceId: string }>, res: Response) {
    const findUser = await this.securityQueryRepository.getUserByDeviceId(req.params.deviceId);

    if (!findUser) {
      return res.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
    }
    // @ts-ignore
    if (findUser && findUser.accountData.login !== req.userRefreshTokenPayload.login) {
      return res.sendStatus(constants.HTTP_STATUS_FORBIDDEN);
    }

    const response = await this.securityWriteRepository.deleteDeviceSessionById(
      // @ts-ignore
      req.userRefreshTokenPayload.login,
      req.params.deviceId,
    );

    if (!response) {
      throw new UnauthorizedException();
    }

    res.sendStatus(constants.HTTP_STATUS_NO_CONTENT);
  }
}
