import { define } from 'typeorm-seeding';

import { faker } from '@faker-js/faker';
import UserEntityTypeOrm from '../../entities/typeorm/user.entity';
import { getRandomDateWithTimeZone } from '../../../common/utils/get-random-date-with-time-zone';

define(UserEntityTypeOrm, () => {
  const user = new UserEntityTypeOrm();

  user.login = faker.internet.displayName();
  user.password = faker.internet.password({ length: 20 });
  user.email = faker.internet.email();
  user.created_at = new Date(getRandomDateWithTimeZone());
  user.is_banned = faker.datatype.boolean({ probability: 0.8 });

  if (user.is_banned) {
    user.ban_reason = faker.lorem.slug(10);
    user.ban_date = getRandomDateWithTimeZone();
  } else {
    user.ban_reason = null;
    user.ban_date = null;
  }

  user.confirmation_code = null;
  user.expiration_date = null;
  user.is_confirmed = false;

  return user;
});
