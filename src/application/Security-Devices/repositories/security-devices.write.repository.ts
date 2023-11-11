import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import DeviceEntity from '../../../db/entities/typeorm/device.entity';

@Injectable()
export class SecurityDevicesWriteRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(DeviceEntity) private readonly securityDevicesRepository: Repository<DeviceEntity>,
  ) {}

  public async create() {
    return this.securityDevicesRepository.create();
  }

  public async save(device: DeviceEntity): Promise<DeviceEntity | null> {
    return this.securityDevicesRepository.save(device);
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
    const res = await this.securityDevicesRepository.update(
      { device_id: deviceId },
      { expiration_date: expirationDate, issued_at: newIssuedAt },
    );

    return !res.affected ? false : res.affected > 0;
  }

  public async deleteDeviceSessionById(deviceId: string): Promise<boolean> {
    const res = await this.securityDevicesRepository.delete({ device_id: deviceId });

    return !res.affected ? false : res.affected > 0;
  }

  public async deleteAllDeviceSessions(userId: string, activeDeviceId: string): Promise<boolean> {
    if (!userId || !Number.isInteger(+userId)) {
      return false;
    }

    const res = await this.securityDevicesRepository
      .createQueryBuilder()
      .delete()
      .where('user_id = :userId AND device_id != :activeDeviceId', { userId, activeDeviceId })
      .execute();

    return !res.affected ? false : res.affected > 0;
  }

  public async deleteAllDevicesByUserId(userId: string): Promise<boolean> {
    if (!userId || !Number.isInteger(+userId)) {
      return false;
    }

    const res = await this.securityDevicesRepository.delete({ user_id: +userId });

    return !res.affected ? false : res.affected > 0;
  }

  public async deleteMany() {}
}
