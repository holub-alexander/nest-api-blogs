import { setSeederFactory } from 'typeorm-extension';
import ReactionEntity from '../../entities/reaction.entity';
import { getRandomDateWithTimeZone } from '../../../common/utils/get-random-date-with-time-zone';
import { LikeStatuses } from '../../../common/interfaces';

export const ReactionFactory = setSeederFactory(ReactionEntity, (faker) =>
  ReactionEntity.fromPartial({
    created_at: new Date(getRandomDateWithTimeZone()),
    like_status: Math.random() >= 0.5 ? LikeStatuses.LIKE : LikeStatuses.DISLIKE,
  }),
);
