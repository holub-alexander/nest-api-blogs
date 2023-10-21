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
import { DeviceViewModel } from '../../Security-Devices/interfaces';
import { SecurityMapper } from '../../../common/mappers/typeorm/security-devices.mapper';
import { SkipThrottle } from '@nestjs/throttler';
import { RefreshTokenGuard } from '../../Auth/guards/refresh-token.guard';
import { SecurityDevicesQueryRepository } from '../../Security-Devices/repositories/security-devices.query.repository';
import { UsersQueryRepository } from '../../Users/repositories/users.query.repository';
import { SecurityDevicesWriteRepository } from '../../Security-Devices/repositories/security-devices.write.repository';

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

    if (!user.id.toString() || !Number.isInteger(+user.id.toString())) {
      throw new UnauthorizedException();
    }

    const devices = await this.securityQueryRepository.findAllByUserId(user.id.toString());

    return SecurityMapper.getAllDevicesForUser(devices);
  }

  @Delete()
  @UseGuards(RefreshTokenGuard)
  @HttpCode(204)
  public async deleteAllSessions(@Req() req: Request) {
    const foundDevice = await this.securityQueryRepository.findDeviceById(req.userRefreshTokenPayload.deviceId);

    if (!foundDevice) {
      throw new NotFoundException();
    }

    const foundUser = await this.usersQueryRepository.findUserById(foundDevice.user_id.toString());

    if (!foundUser) {
      throw new NotFoundException();
    }

    return this.securityWriteRepository.deleteAllDeviceSessions(
      foundUser.id.toString(),
      req.userRefreshTokenPayload.deviceId,
    );
  }

  @Delete('/:deviceId')
  @UseGuards(RefreshTokenGuard)
  @HttpCode(204)
  public async deleteSessionById(@Req() req: Request<{ deviceId: string }>) {
    const foundDevice = await this.securityQueryRepository.findDeviceById(req.params.deviceId);

    if (!foundDevice) {
      throw new NotFoundException();
    }

    const foundUser = await this.usersQueryRepository.findUserById(foundDevice.user_id.toString());

    if (!foundUser) {
      throw new NotFoundException();
    }

    if (foundUser && foundUser.login !== req.userRefreshTokenPayload.login) {
      throw new ForbiddenException();
    }

    const response = await this.securityWriteRepository.deleteDeviceSessionById(req.params.deviceId);

    if (!response) {
      throw new UnauthorizedException();
    }
  }
}
