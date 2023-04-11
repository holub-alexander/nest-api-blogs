import { ObjectId } from 'mongodb';
import { Injectable } from '@nestjs/common';
import { SecurityDevicesWriteRepository } from '@/security-devices/repositories/security-devices.write.repository';
import { RefreshTokensMeta, RefreshTokensMetaDocument } from '@/entity/user.entity';
import { add } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

/* TODO: Edit this module */

@Injectable()
export class SecurityDevicesService {
  constructor(
    private readonly securityWriteRepository: SecurityDevicesWriteRepository,
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

  // public async updateDeviceRefreshToken({
  //   login,
  //   deviceId,
  //   iat,
  // }: {
  //   login: string;
  //   deviceId: string;
  //   iat: number;
  // }): Promise<string | null> {
  //   const newIssuedAtWithoutMs = new Date(new Date().setMilliseconds(0));
  //
  //   const data = {
  //     deviceId,
  //     expirationDate: add(new Date(), {
  //       seconds: 20,
  //     }),
  //     issuedAt: new Date(iat * 1000),
  //     newIssuedAt: newIssuedAtWithoutMs,
  //   };
  //
  //   const isUpdated = await this.securityWriteRepository.updateDeviceRefreshToken(data);
  //
  //   if (isUpdated) {
  //     // @ts-ignore
  //     return await jwtToken(
  //       {
  //         login,
  //         deviceId,
  //         iat: newIssuedAtWithoutMs.valueOf() / 1000,
  //         // @ts-ignore
  //       } as UserRefreshTokenPayload,
  //       process.env.REFRESH_TOKEN_PRIVATE_KEY as string,
  //       '2h',
  //     );
  //   }
  //
  //   return null;
  // }
}
