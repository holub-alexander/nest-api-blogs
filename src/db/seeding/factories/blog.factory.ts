import { setSeederFactory } from 'typeorm-extension';
import BlogEntity from '../../entities/blog.entity';

export const BlogFactory = setSeederFactory(BlogEntity, (faker) =>
  BlogEntity.fromPartial({
    name: faker.lorem.slug(5),
    description: faker.lorem.slug(20),
    website_url: faker.internet.url(),
    created_at: new Date(),
    is_membership: false,
  }),
);
