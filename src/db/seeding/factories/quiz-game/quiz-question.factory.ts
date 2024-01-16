import { setSeederFactory } from 'typeorm-extension';
import { getRandomDateWithTimeZone } from '../../../../common/utils/get-random-date-with-time-zone';
import QuizQuestionEntity from '../../../entities/quiz-game/quiz-question.entity';

export const QuizQuestionFactory = setSeederFactory(QuizQuestionEntity, (faker) =>
  QuizQuestionEntity.fromPartial({
    body: faker.lorem.text().slice(0, 500),
    correct_answers: new Array(faker.number.int({ min: 3, max: 10 })).fill(null).map(() => faker.lorem.words(1)),
    published: faker.number.int({ min: 1, max: 2 }) === 1,
    created_at: new Date(getRandomDateWithTimeZone()),
    updated_at: faker.number.int({ min: 1, max: 2 }) === 1 ? new Date(getRandomDateWithTimeZone()) : null,
  }),
);
