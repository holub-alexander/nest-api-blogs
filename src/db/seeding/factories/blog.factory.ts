import { define } from 'typeorm-seeding';
import { faker } from '@faker-js/faker';
import BlogEntityTypeOrm from '../../entities/typeorm/blog.entity';

define(BlogEntityTypeOrm, () => {
  const blog = new BlogEntityTypeOrm();

  blog.name = faker.lorem.slug(5);
  blog.description = faker.lorem.slug(20);
  blog.website_url = faker.internet.url();
  blog.created_at = new Date();
  blog.is_membership = false;

  return blog;
});
