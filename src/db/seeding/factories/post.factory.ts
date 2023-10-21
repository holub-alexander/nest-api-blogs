import { define } from 'typeorm-seeding';

import { faker } from '@faker-js/faker';
import PostEntityTypeOrm from '../../entities/typeorm/post.entity';

define(PostEntityTypeOrm, () => {
  const post = new PostEntityTypeOrm();

  post.title = faker.lorem.text().slice(0, 30);
  post.short_description = faker.lorem.text().slice(0, 100);
  post.content = faker.lorem.text().slice(0, 1000);
  post.created_at = faker.date.recent();
  post.blog_id = 1;

  return post;
});
