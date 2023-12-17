import { HttpStatus, INestApplication } from '@nestjs/common';
import { buildTestApplication } from '../../common/build-test-application';
import { getDataSourceToken } from '@nestjs/typeorm';
import { runSeeders } from 'typeorm-extension';
import { SuperAdminModule } from './super-admin.module';
import { createBlogFactory } from '../../db/seeding/factories/utils/create-blog.factory';
import request from 'supertest';
import { setBasicAuthToken } from '../../test-utils/utils';

jest.setTimeout(7e3);
describe('SuperAdminModule', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await buildTestApplication(SuperAdminModule);

    const dataSource = app.get(getDataSourceToken());

    await runSeeders(dataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Blogs flow for super admin users', () => {
    const createdBlog = createBlogFactory.buildOne();

    it('[POST] should return an authorization error if the user tries to create a blog without authorization', async () => {
      if (!createdBlog) {
        throw new Error('Failed to create blog');
      }

      await request(app.getHttpServer()).post('/sa/blogs').send(createdBlog).expect(HttpStatus.UNAUTHORIZED);
    });

    it('[POST] should create a blog and return this blog', async () => {
      if (!createdBlog) {
        throw new Error('Failed to create a blog');
      }

      await setBasicAuthToken(request(app.getHttpServer()).post('/sa/blogs'))
        .send(createdBlog)
        .expect(HttpStatus.CREATED)
        .expect(({ body }) =>
          expect(body).toMatchObject({
            id: expect.any(String),
            ...createdBlog,
            createdAt: expect.any(String),
            isMembership: expect.any(Boolean),
          }),
        );
    });

    it('[DELETE] should return authorization error if super admin unauthorized', async () => {
      await request(app.getHttpServer()).delete(`/sa/blogs/1`).expect(HttpStatus.UNAUTHORIZED);
    });

    it('[DELETE] should return 404 status if blog does not exist or deleted', async () => {
      const response = await setBasicAuthToken(request(app.getHttpServer()).post('/sa/blogs'))
        .send(createdBlog)
        .expect(HttpStatus.CREATED);

      await setBasicAuthToken(request(app.getHttpServer()).delete(`/sa/blogs/${response.body.id}`))
        .expect(HttpStatus.NO_CONTENT)
        .expect({});

      await setBasicAuthToken(request(app.getHttpServer()).delete(`/sa/blogs/${response.body.id}`)).expect(
        HttpStatus.NOT_FOUND,
      );
      await setBasicAuthToken(request(app.getHttpServer()).delete(`/sa/blogs/100`)).expect(HttpStatus.NOT_FOUND);
    });

    it('[DELETE] should delete saved blog and return correct status', async () => {
      const response = await setBasicAuthToken(request(app.getHttpServer()).post('/sa/blogs'))
        .send(createdBlog)
        .expect(HttpStatus.CREATED);

      if (!response.body) {
        throw new Error('Saved blog does not exist');
      }

      await setBasicAuthToken(request(app.getHttpServer()).delete(`/sa/blogs/${response.body.id}`))
        .expect(HttpStatus.NO_CONTENT)
        .expect({});
      await request(app.getHttpServer()).get(`/blogs/${response.body.id}`).expect(HttpStatus.NOT_FOUND);
    });
  });
});
