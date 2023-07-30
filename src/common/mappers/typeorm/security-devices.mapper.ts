import { DeviceViewModel } from '../../../application/Security-Devices/interfaces';
import DeviceEntityTypeOrm from '../../../db/entities/typeorm/device.entity';

export class SecurityMapper {
  public static getAllDevicesForUser(data: DeviceEntityTypeOrm[]): DeviceViewModel[] {
    return data.map((device) => ({
      ip: device.ip,
      title: device.title,
      deviceId: device.device_id,
      lastActiveDate: device.issued_at,
    }));
  }
}
