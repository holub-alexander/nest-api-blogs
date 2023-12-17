import { setSeederFactory } from 'typeorm-extension';
import DeviceEntity from '../../entities/typeorm/device.entity';
import { getRandomDateWithTimeZone } from '../../../common/utils/get-random-date-with-time-zone';

export const DeviceFactory = setSeederFactory(DeviceEntity, (faker) =>
  DeviceEntity.fromPartial({
    ip: faker.internet.ip(),
    title: faker.internet.userAgent(),
    device_id: faker.string.uuid(),
    issued_at: new Date(getRandomDateWithTimeZone()),
    expiration_date: new Date(getRandomDateWithTimeZone()),
  }),
);
