import { define } from 'typeorm-seeding';

import { faker } from '@faker-js/faker';
import { getRandomDateWithTimeZone } from '../../../common/utils/get-random-date-with-time-zone';
import DeviceEntityTypeOrm from '../../entities/typeorm/device.entity';

define(DeviceEntityTypeOrm, () => {
  const device = new DeviceEntityTypeOrm();

  device.ip = faker.internet.ip();
  device.title = faker.internet.userAgent();
  device.device_id = faker.string.uuid();
  device.issued_at = getRandomDateWithTimeZone();
  device.expiration_date = getRandomDateWithTimeZone();

  return device;
});
