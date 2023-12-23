import { Injectable } from '@nestjs/common';
import DeviceEntity from '../../../db/entities/device.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class SecurityDevicesQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  public async findDeviceById(deviceId: string): Promise<DeviceEntity> {
    const result = await this.dataSource.query(
      `
      SELECT * FROM devices
      WHERE device_id = $1;
    `,
      [deviceId],
    );

    return result[0];
  }

  public async findAllByUserId(userId: string): Promise<DeviceEntity[]> {
    return this.dataSource.query<DeviceEntity[]>(
      `
      SELECT * FROM devices
      WHERE user_id = $1;
    `,
      [userId],
    );
  }

  public async findDeviceByIssuedAt(userId: string): Promise<DeviceEntity[]> {
    return this.dataSource.query<DeviceEntity[]>(
      `
      SELECT * FROM devices
      WHERE user_id = $1;
    `,
      [userId],
    );
  }
}
