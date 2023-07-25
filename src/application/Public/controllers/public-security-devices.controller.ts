import { Request } from 'express';
import {
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { SecurityDevicesQueryRepository } from '../../Security-Devices/repositories/security-devices.query.repository';
import { SecurityDevicesWriteRepository } from '../../Security-Devices/repositories/security-devices.write.repository';
import { UsersQueryRepository } from '../../Users/repositories/mongoose/users.query.repository';
import { DeviceViewModel } from '../../Security-Devices/interfaces';
import { SecurityMapper } from '../../../common/mappers/security-devices.mapper';
import { SkipThrottle } from '@nestjs/throttler';
import { RefreshTokenGuard } from '../../Auth/guards/refresh-token.guard';

@SkipThrottle()
@Controller('security/devices')
export class PublicSecurityDevicesController {
  constructor(
    private readonly securityQueryRepository: SecurityDevicesQueryRepository,
    private readonly securityWriteRepository: SecurityDevicesWriteRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  @Get()
  @UseGuards(RefreshTokenGuard)
  public async findAllSessions(@Req() req: Request): Promise<DeviceViewModel[]> {
    const user = await this.usersQueryRepository.findByLogin(req.userRefreshTokenPayload.login);

    if (!user) {
      throw new UnauthorizedException();
    }

    return SecurityMapper.getAllDevicesForUser(user.refreshTokensMeta);
  }

  @Delete()
  @UseGuards(RefreshTokenGuard)
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
  @UseGuards(RefreshTokenGuard)
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
