import { setSeederFactory } from 'typeorm-extension';
import PostEntity from '../../entities/post.entity';

export const PostFactory = setSeederFactory(PostEntity, (faker) =>
  PostEntity.fromPartial({
    title: faker.lorem.text().slice(0, 30),
    short_description: faker.lorem.text().slice(0, 100),
    content: faker.lorem.text().slice(0, 1000),
    created_at: faker.date.recent(),
  }),
);
