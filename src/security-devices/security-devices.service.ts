import { ObjectId } from 'mongodb';
import { Injectable } from '@nestjs/common';
import { add } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { SecurityDevicesWriteRepository } from './repositories/security-devices.write.repository';
import { RefreshTokensMeta, RefreshTokensMetaDocument } from '../entity/user.entity';
import { UserRefreshTokenPayload } from '../auth/interfaces';

@Injectable()
export class SecurityDevicesService {
  constructor(
    private readonly securityWriteRepository: SecurityDevicesWriteRepository,
    private readonly jwtService: JwtService,
    @InjectModel(RefreshTokensMeta.name) private readonly refreshTokensMetaModel: Model<RefreshTokensMetaDocument>,
  ) {}

  public async create({
    userId,
    ip,
    userAgent = null,
  }: {
    userId: ObjectId;
    ip: string;
    userAgent?: string | null;
  }): Promise<{ deviceId: string; issuedAt: Date } | null> {
    const data = new this.refreshTokensMetaModel({
      issuedAt: new Date(new Date().setMilliseconds(0)),
      expirationDate: add(new Date(), {
        seconds: 20,
      }),
      deviceId: uuidv4(),
      title: userAgent,
      ip,
    });

    const res = await this.securityWriteRepository.create(userId, data);

    return res ? { deviceId: data.deviceId, issuedAt: data.issuedAt } : null;
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
        seconds: 20,
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
        { secret: process.env.REFRESH_TOKEN_PRIVATE_KEY as string, expiresIn: '2h' },
      );
    }

    return null;
  }
}
