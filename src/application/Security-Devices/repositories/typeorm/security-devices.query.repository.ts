import { Injectable } from '@nestjs/common';
import DeviceEntityTypeOrm from '../../../../db/entities/typeorm/device.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class SecurityDevicesTypeOrmQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  public async findDeviceById(deviceId: string): Promise<DeviceEntityTypeOrm> {
    // return this.UserModel.findOne<User>({ 'refreshTokensMeta.deviceId': deviceId });

    const result = await this.dataSource.query(
      `
      SELECT * FROM devices
      WHERE device_id = $1;
    `,
      [deviceId],
    );

    return result[0];
  }

  public async findAllByUserId(userId: string): Promise<DeviceEntityTypeOrm[]> {
    return this.dataSource.query<DeviceEntityTypeOrm[]>(
      `
      SELECT * FROM devices
      WHERE user_id = $1;
    `,
      [userId],
    );
  }
}
