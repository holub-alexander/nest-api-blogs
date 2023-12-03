import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { getDataSourceToken } from '@nestjs/typeorm';
import { runSeeders } from 'typeorm-extension';
import { BlogsModule } from './blogs.module';
import { buildTestApplication } from '../../common/build-test-application';
import { createBlogFactory } from '../../db/seeding/factories/utils/create-blog.factory';
import { PaginationBlogDto } from './dto/pagination-blog.dto';
import { SortDirections } from '../../common/interfaces';

jest.setTimeout(7e3);

const searchParams: Partial<PaginationBlogDto>[] = [
  { sortBy: 'created_at', sortDirection: SortDirections.DESC, pageNumber: 1 },
  { sortBy: 'name', pageSize: 5 },
  { sortBy: 'created_at', sortDirection: SortDirections.DESC, pageNumber: 2, pageSize: 5 },
  { sortDirection: SortDirections.ASC, pageNumber: 10, pageSize: 1 },
];

const TOTAL_COUNT = 10;

describe('BlogsModule', () => {
  let app: INestApplication;
  const createdBlog = createBlogFactory.buildOne();

  beforeAll(async () => {
    app = await buildTestApplication(BlogsModule);

    const dataSource = app.get(getDataSourceToken());

    await runSeeders(dataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  it.each([1, 2])('[GET] get one blog by id "%s"', async (id) => {
    await request(app.getHttpServer())
      .get(`/blogs/${id}`)
      .expect(HttpStatus.OK)
      .expect(({ body }) =>
        expect(body).toMatchObject({
          id: id.toString(),
          name: expect.any(String),
          description: expect.any(String),
          websiteUrl: expect.any(String),
          createdAt: expect.any(String),
          isMembership: expect.any(Boolean),
        }),
      );
  });

  it("[GET] fail to get a blog when it doesn't exist", async () => {
    await request(app.getHttpServer()).get('/blogs/100').expect(HttpStatus.NOT_FOUND).expect({});
  });

  it.each(searchParams)('[GET] should return a valid list with valid parameters "%s"', async (query) => {
    await request(app.getHttpServer())
      .get('/blogs')
      .query(query)
      .expect(HttpStatus.OK)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          pagesCount: Math.ceil(TOTAL_COUNT / ((query && query?.pageSize) ?? 10)),
          page: query.pageNumber ?? 1,
          pageSize: query.pageSize ?? 10,
          totalCount: TOTAL_COUNT,
          items: expect.any(Array),
        });
      })
      .expect(({ body }) => {
        expect(body.items).toHaveLength((query && query?.pageSize) ?? 10);
      });
  });

  it('[POST] should return an authorization error if the user tries to create a blog without authorization', async () => {
    if (!createdBlog) {
      throw new Error('Failed to create blog');
    }

    await request(app.getHttpServer()).post('/sa/blogs').send(createdBlog).expect(HttpStatus.UNAUTHORIZED);
  });
});
