import { ObjectId } from 'mongodb';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { RefreshTokensMeta, User, UserDocument } from '../../../entity/user.entity';

@Injectable()
export class SecurityDevicesWriteRepository {
  constructor(@InjectModel(User.name) private readonly UserModel: Model<UserDocument>) {}

  public async create(userId: ObjectId, refreshTokenMetaData: RefreshTokensMeta): Promise<boolean> {
    const res = await this.UserModel.updateOne(
      { _id: userId },
      {
        $push: {
          refreshTokensMeta: refreshTokenMetaData,
        },
      },
    );

    return res.modifiedCount === 1;
  }

  public async updateDeviceRefreshToken({
    deviceId,
    expirationDate,
    issuedAt,
    newIssuedAt,
  }: {
    deviceId: string;
    expirationDate: Date;
    issuedAt: Date;
    newIssuedAt: Date;
  }) {
    const res = await this.UserModel.updateOne(
      { 'refreshTokensMeta.deviceId': deviceId, 'refreshTokensMeta.issuedAt': issuedAt },
      {
        $set: {
          'refreshTokensMeta.$.deviceId': deviceId,
          'refreshTokensMeta.$.issuedAt': newIssuedAt,
          'refreshTokensMeta.$.expirationDate': expirationDate,
        },
      },
    );

    return res.modifiedCount === 1;
  }

  public async deleteDeviceSessionById(login: string, deviceId: string): Promise<boolean> {
    const res = await this.UserModel.updateOne(
      { 'accountData.login': login, 'refreshTokensMeta.deviceId': deviceId },
      { $pull: { refreshTokensMeta: { deviceId } } },
    );

    return res.modifiedCount === 1;
  }

  public async deleteAllDeviceSessions(userId: ObjectId, deviceId: string): Promise<boolean> {
    const res = await this.UserModel.updateOne(
      { _id: userId },
      { $pull: { refreshTokensMeta: { deviceId: { $ne: deviceId } } } },
    );

    return res.modifiedCount === 1;
  }

  public async deleteAllDevices(userId: ObjectId): Promise<boolean> {
    const res = await this.UserModel.updateOne({ _id: userId }, { refreshTokensMeta: [] });

    return res.modifiedCount === 1;
  }
}
