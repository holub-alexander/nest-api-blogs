import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import DeviceEntityTypeOrm from '../../../db/entities/typeorm/device.entity';

@Injectable()
export class SecurityDevicesWriteRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  public async create(device: DeviceEntityTypeOrm): Promise<boolean> {
    const result = await this.dataSource.query<DeviceEntityTypeOrm>(
      `
      INSERT INTO devices (user_id, ip, title, device_id, issued_at, expiration_date)
      VALUES ($1, $2, $3, $4, $5, $6);
    `,
      [device.user_id, device.ip, device.title, device.device_id, device.issued_at, device.expiration_date],
    );

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
    const result = await this.dataSource.query<[[], number]>(
      `
      DELETE FROM devices
      WHERE device_id = $1;
    `,
      [deviceId],
    );

    return result[1] > 0;
  }

  public async deleteAllDeviceSessions(userId: string, activeDeviceId: string): Promise<boolean> {
    if (!userId || !Number.isInteger(+userId)) {
      return false;
    }

    const result = await this.dataSource.query<[[], number]>(
      `
      DELETE FROM devices
      WHERE user_id = $1 AND device_id != $2
    `,
      [userId, activeDeviceId],
    );

    return result[1] > 0;
  }

  public async deleteAllDevicesByUserId(userId: string): Promise<boolean> {
    if (!userId || !Number.isInteger(+userId)) {
      return false;
    }

    const result = await this.dataSource.query<[[], number]>(
      `
      DELETE FROM devices
      WHERE user_id = $1;
    `,
      [userId],
    );

    return result[1] > 0;
  }

  public async deleteMany() {}
}
