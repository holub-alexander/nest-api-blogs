import { define } from 'typeorm-seeding';

import { faker } from '@faker-js/faker';
import PostEntity from '../../entities/typeorm/post.entity';

define(PostEntity, () => {
  const post = new PostEntity();

  post.title = faker.lorem.text().slice(0, 30);
  post.short_description = faker.lorem.text().slice(0, 100);
  post.content = faker.lorem.text().slice(0, 1000);
  post.created_at = faker.date.recent();
  post.blog_id = 1;

  return post;
});
