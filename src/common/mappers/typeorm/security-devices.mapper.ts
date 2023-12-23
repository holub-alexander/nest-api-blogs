import { DeviceViewModel } from '../../../application/Security-Devices/interfaces';
import DeviceEntity from '../../../db/entities/device.entity';

export class SecurityMapper {
  public static getAllDevicesForUser(data: DeviceEntity[]): DeviceViewModel[] {
    return data.map((device) => ({
      ip: device.ip,
      title: device.title,
      deviceId: device.device_id,
      lastActiveDate: device.issued_at,
    }));
  }
}
