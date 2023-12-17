import { setSeederFactory } from 'typeorm-extension';
import { getRandomDateWithTimeZone } from '../../../common/utils/get-random-date-with-time-zone';
import CommentEntity from '../../entities/typeorm/comment.entity';

export const CommentFactory = setSeederFactory(CommentEntity, (faker) =>
  CommentEntity.fromPartial({
    created_at: new Date(getRandomDateWithTimeZone()),
    content: faker.lorem.text().slice(0, 100),
  }),
);
