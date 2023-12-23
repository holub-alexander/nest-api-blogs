import { setSeederFactory } from 'typeorm-extension';
import UserEntity from '../../entities/user.entity';
import { getRandomDateWithTimeZone } from '../../../common/utils/get-random-date-with-time-zone';

export const UserFactory = setSeederFactory(UserEntity, (faker) =>
  UserEntity.fromPartial({
    login: faker.internet.displayName(),
    password: faker.internet.password({ length: 20 }),
    email: faker.internet.email().toLowerCase(),
    created_at: new Date(getRandomDateWithTimeZone()),
    confirmation_code: null,
    expiration_date: null,
    is_confirmed: false,
  }),
);
