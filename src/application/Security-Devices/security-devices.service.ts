import { Injectable } from '@nestjs/common';
import { add } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { JwtService } from '@nestjs/jwt';
import { UserRefreshTokenPayload } from '../Auth/interfaces';
import config from '../../config/config';
import { SecurityDevicesWriteRepository } from './repositories/security-devices.write.repository';

@Injectable()
export class SecurityDevicesService {
  constructor(
    private readonly securityWriteRepository: SecurityDevicesWriteRepository,
    private readonly jwtService: JwtService,
  ) {}

  public async create({
    userId,
    ip,
    userAgent = '',
  }: {
    userId: number;
    ip: string;
    userAgent?: string;
  }): Promise<{ deviceId: string; issuedAt: Date } | null> {
    const device = await this.securityWriteRepository.create();

    device.user_id = userId;
    device.issued_at = new Date(new Date().setMilliseconds(0));
    device.expiration_date = add(new Date(), {
      seconds: parseInt(config.refreshTokenExpiration),
    });
    device.device_id = uuidv4();
    device.title = userAgent;
    device.ip = ip;

    const res = await this.securityWriteRepository.save(device);

    return res ? { deviceId: device.device_id, issuedAt: device.issued_at } : null;
  }

  public async updateDeviceRefreshToken({
    login,
    deviceId,
    iat,
  }: {
    login: string;
    deviceId: string;
    iat: number;
  }): Promise<string | null> {
    const newIssuedAtWithoutMs = new Date(new Date().setMilliseconds(0));

    const data = {
      deviceId,
      expirationDate: add(new Date(), {
        seconds: parseInt(config.refreshTokenExpiration),
      }),
      issuedAt: new Date(iat * 1000),
      newIssuedAt: newIssuedAtWithoutMs,
    };

    const isUpdated = await this.securityWriteRepository.updateDeviceRefreshToken(data);

    if (isUpdated) {
      return this.jwtService.sign(
        {
          login,
          deviceId,
          iat: newIssuedAtWithoutMs.valueOf() / 1000,
        } as UserRefreshTokenPayload,
        { secret: process.env.REFRESH_TOKEN_PRIVATE_KEY as string, expiresIn: config.refreshTokenExpiration },
      );
    }

    return null;
  }
}
