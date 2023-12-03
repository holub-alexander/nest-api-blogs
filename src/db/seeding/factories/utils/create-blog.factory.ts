import { FactoryBuilder } from 'factory.io';
import { faker } from '@faker-js/faker';
import { CreateBlogDto } from '../../../../application/Blogs/dto/create.dto';

export const createBlogFactory = FactoryBuilder.of(CreateBlogDto)
  .props({
    name: faker.lorem.slug(5),
    description: faker.lorem.slug(20),
    websiteUrl: faker.internet.url(),
  })
  .build();
