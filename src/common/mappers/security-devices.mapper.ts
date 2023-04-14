import { RefreshTokensMeta } from '../../entity/user.entity';
import { DeviceViewModel } from '../../security-devices/interfaces';

export class SecurityMapper {
  public static getAllDevicesForUser(data: RefreshTokensMeta[]): DeviceViewModel[] {
    return data.map((device) => ({
      ip: device.ip,
      title: device.title,
      deviceId: device.deviceId,
      lastActiveDate: device.issuedAt,
    }));
  }
}
