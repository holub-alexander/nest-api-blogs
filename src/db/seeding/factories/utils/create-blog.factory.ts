import { FactoryBuilder } from 'factory.io';
import { faker } from '@faker-js/faker';
import { CreateBlogDto } from '../../../../application/Blogs/dto/create.dto';

export const createBlogFactory = FactoryBuilder.of(CreateBlogDto)
  .props({
    name: faker.person.fullName().slice(0, 15),
    description: faker.lorem.slug(10).slice(0, 40),
    websiteUrl: faker.internet.url(),
  })
  .build();
