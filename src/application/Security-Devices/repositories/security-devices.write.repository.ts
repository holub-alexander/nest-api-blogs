import { ObjectId } from 'mongodb';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { RefreshTokensMeta, User, UserDocument } from '../../../db/entities/mongoose/user.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import DeviceEntityTypeOrm from '../../../db/entities/typeorm/device.entity';

@Injectable()
export class SecurityDevicesWriteRepository {
  constructor(
    @InjectModel(User.name) private readonly UserModel: Model<UserDocument>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  public async create(device: DeviceEntityTypeOrm): Promise<boolean> {
    // const res = await this.UserModel.updateOne(
    //   { _id: userId },
    //   {
    //     $push: {
    //       refreshTokensMeta: refreshTokenMetaData,
    //     },
    //   },
    // );

    const result = this.dataSource.query(
      `
      INSERT INTO devices (user_id, ip, title, device_id, issued_at, expiration_date)
      VALUES ($1, $2, $3, $4, $5, $6);
    `,
      [device.user.id, device.ip, device.title, device.device_id, device.issued_at, device.expiration_date],
    );

    console.log('SecurityDevicesWriteRepository', 'create', result);

    return Boolean(result);
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
