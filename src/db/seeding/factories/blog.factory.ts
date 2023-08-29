import { define } from 'typeorm-seeding';
import { faker } from '@faker-js/faker';
import BlogEntityTypeOrm from '../../entities/typeorm/blog.entity';

define(BlogEntityTypeOrm, () => {
  const blog = new BlogEntityTypeOrm();

  blog.name = faker.lorem.slug(5);
  blog.description = faker.lorem.slug(20);
  blog.website_url = faker.internet.url();
  blog.created_at = new Date();
  blog.user_id = 2;
  blog.is_membership = false;
  // blog.is_banned = faker.datatype.boolean({ probability: 0.4 });
  blog.is_banned = false;

  if (blog.is_banned) {
    blog.ban_date = new Date();
  } else {
    blog.ban_date = null;
  }

  return blog;
});
