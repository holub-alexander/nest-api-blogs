import { ObjectId } from 'mongodb';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { User, UserDocument } from '../../../../db/entities/mongoose/user.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import DeviceEntityTypeOrm from '../../../../db/entities/typeorm/device.entity';

@Injectable()
export class SecurityDevicesTypeOrmWriteRepository {
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

    const result = await this.dataSource.query<DeviceEntityTypeOrm>(
      `
      INSERT INTO devices (user_id, ip, title, device_id, issued_at, expiration_date)
      VALUES ($1, $2, $3, $4, $5, $6);
    `,
      [device.user_id, device.ip, device.title, device.device_id, device.issued_at, device.expiration_date],
    );

    console.log('SecurityDevicesWriteRepository', 'create', result);

    return Boolean(result);
  }

  public async updateDeviceRefreshToken({
    deviceId,
    expirationDate,
    newIssuedAt,
  }: {
    deviceId: string;
    expirationDate: Date;
    newIssuedAt: Date;
  }) {
    // const res = await this.UserModel.updateOne(
    //   { 'refreshTokensMeta.deviceId': deviceId, 'refreshTokensMeta.issuedAt': issuedAt },
    //   {
    //     $set: {
    //       'refreshTokensMeta.$.deviceId': deviceId,
    //       'refreshTokensMeta.$.issuedAt': newIssuedAt,
    //       'refreshTokensMeta.$.expirationDate': expirationDate,
    //     },
    //   },
    // );

    // return res.modifiedCount === 1;

    const result = await this.dataSource.query<[DeviceEntityTypeOrm[], number]>(
      `
      UPDATE devices
      SET expiration_date = $2,
          issued_at = $3
      WHERE device_id = $1;
    `,
      [deviceId, expirationDate, newIssuedAt],
    );

    return result[1] > 0;
  }

  public async deleteDeviceSessionById(deviceId: string): Promise<boolean> {
    // const res = await this.UserModel.updateOne(
    //   { 'accountData.login': login, 'refreshTokensMeta.deviceId': deviceId },
    //   { $pull: { refreshTokensMeta: { deviceId } } },
    // );
    //
    // return res.modifiedCount === 1;

    const result = await this.dataSource.query<[[], number]>(
      `
      DELETE FROM devices
      WHERE device_id = $1;
    `,
      [deviceId],
    );

    console.log(result);

    return result[1] > 0;
  }

  public async deleteAllDeviceSessions(userId: string, activeDeviceId: string): Promise<boolean> {
    // const res = await this.UserModel.updateOne(
    //   { _id: userId },
    //   { $pull: { refreshTokensMeta: { deviceId: { $ne: deviceId } } } },
    // );
    //
    // return res.modifiedCount === 1;

    const result = await this.dataSource.query<[[], number]>(
      `
      DELETE FROM devices
      WHERE user_id = $1 AND device_id != $2
    `,
      [userId, activeDeviceId],
    );

    console.log(result);

    return result[1] > 0;
  }

  public async deleteAllDevicesByUserId(userId: ObjectId): Promise<boolean> {
    const res = await this.UserModel.updateOne({ _id: userId }, { refreshTokensMeta: [] });

    return res.modifiedCount === 1;
  }

  public async deleteMany() {}
}
