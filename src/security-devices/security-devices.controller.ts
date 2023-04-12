import { Request, Response } from 'express';
import { constants } from 'http2';
import {
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersQueryRepository } from '@/users/repositories/users.query.repository';
import { SecurityDevicesQueryRepository } from '@/security-devices/repositories/security-devices.query.repository';
import { SecurityDevicesWriteRepository } from '@/security-devices/repositories/security-devices.write.repository';
import { SecurityMapper } from '@/common/mappers/security-devices.mapper';
import { DeviceViewModel } from '@/security-devices/interfaces';

@Controller('security/devices')
export class SecurityDevicesController {
  constructor(
    private readonly securityQueryRepository: SecurityDevicesQueryRepository,
    private readonly securityWriteRepository: SecurityDevicesWriteRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  @Get()
  public async findAllSessions(@Req() req: Request): Promise<DeviceViewModel[]> {
    const user = await this.usersQueryRepository.findByLogin(req.userRefreshTokenPayload.login);

    if (!user) {
      throw new UnauthorizedException();
    }

    return SecurityMapper.getAllDevicesForUser(user.refreshTokensMeta);
  }

  @Delete()
  @HttpCode(204)
  public async deleteAllSessions(@Req() req: Request) {
    const user = await this.usersQueryRepository.findByDeviceId(
      req.userRefreshTokenPayload.login,

      req.userRefreshTokenPayload.deviceId,
    );

    if (!user) {
      throw new UnauthorizedException();
    }

    await this.securityWriteRepository.deleteAllDeviceSessions(user._id, req.userRefreshTokenPayload.deviceId);
  }

  @Delete('/:deviceId')
  @HttpCode(204)
  public async deleteSessionById(@Req() req: Request<{ deviceId: string }>) {
    const findUser = await this.securityQueryRepository.findUserByDeviceId(req.params.deviceId);

    if (!findUser) {
      throw new NotFoundException();
    }

    if (findUser && findUser.accountData.login !== req.userRefreshTokenPayload.login) {
      throw new ForbiddenException();
    }

    const response = await this.securityWriteRepository.deleteDeviceSessionById(
      req.userRefreshTokenPayload.login,
      req.params.deviceId,
    );

    if (!response) {
      throw new UnauthorizedException();
    }
  }
}
