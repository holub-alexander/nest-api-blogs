import { HttpStatus, INestApplication } from '@nestjs/common';
import { buildTestApplication } from '../../common/build-test-application';
import { getDataSourceToken } from '@nestjs/typeorm';
import { runSeeders } from 'typeorm-extension';
import { QuizQuestionsModule } from './quiz-questions.module';
import request from 'supertest';
import { SA_QUIZ_QUESTIONS_MAIN_ROUTE } from '../../common/constants/endpoints';
import { setBasicAuthToken } from '../../test-utils/utils';
import { QuizQuestionViewModel } from './interfaces';
import { UpdateQuizQuestionDto } from './dto/update.dto';

jest.setTimeout(7e3);

const methods = {
  createQuestion: `[POST ${SA_QUIZ_QUESTIONS_MAIN_ROUTE}]`,
  deleteQuestion: `[DELETE ${SA_QUIZ_QUESTIONS_MAIN_ROUTE}/{id}]`,
  updateQuestion: `[PUT ${SA_QUIZ_QUESTIONS_MAIN_ROUTE}/{id}]`,
  updatePublished: `[PUT ${SA_QUIZ_QUESTIONS_MAIN_ROUTE}/{id}/publish]`,
};

const newQuestion = {
  body: 'New question 1',
  correctAnswers: ['Answer 1', 2, 'Answer 3', 4],
};

describe('QuizQuestions', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await buildTestApplication(QuizQuestionsModule);

    const dataSource = app.get(getDataSourceToken());

    await runSeeders(dataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  describe(methods.createQuestion, () => {
    it('(401) should return a 401 error if user has not been authorized', async () => {
      await request(app.getHttpServer())
        .post('/' + SA_QUIZ_QUESTIONS_MAIN_ROUTE)
        .send({
          body: 'New text for test',
          correctAnswers: ['answer'],
        })
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it.each([[null], [], [{}, {}]])(
      "(400) should return a 400 status code if the correctAnswer field doesn't contain a number or string",
      async (...body) => {
        await setBasicAuthToken(request(app.getHttpServer()).post('/' + SA_QUIZ_QUESTIONS_MAIN_ROUTE))
          .send({
            body: 'New text for test',
            correctAnswers: body,
          })
          .expect(HttpStatus.BAD_REQUEST);
      },
    );

    it('(201) should create a new question and return correct response', async () => {
      const newQuestion = {
        body: 'New question 1',
        correctAnswers: ['Answer 1', 2, 'Answer 3', 4],
      };

      await setBasicAuthToken(request(app.getHttpServer()).post('/' + SA_QUIZ_QUESTIONS_MAIN_ROUTE))
        .send(newQuestion)
        .expect(201)
        .expect(({ body }) =>
          expect(body).toMatchObject<QuizQuestionViewModel>({
            id: expect.any(String),
            published: false,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            ...newQuestion,
          }),
        );
    });
  });

  describe(methods.deleteQuestion, () => {
    it('(401) should return a 401 status if has not been authorized', async () => {
      await request(app.getHttpServer()).delete(`/${SA_QUIZ_QUESTIONS_MAIN_ROUTE}/1`).expect(HttpStatus.UNAUTHORIZED);
    });

    it('(404) should return a 404 status if the question was not found', async () => {
      await setBasicAuthToken(request(app.getHttpServer()).delete(`/${SA_QUIZ_QUESTIONS_MAIN_ROUTE}/1000`)).expect(
        HttpStatus.NOT_FOUND,
      );
    });

    it('(204) should return a 204 status if the question has been deleted', async () => {
      const newQuestion = {
        body: 'New question 1',
        correctAnswers: ['Answer 1', 2, 'Answer 3', 4],
      };

      const response = await setBasicAuthToken(request(app.getHttpServer()).post('/' + SA_QUIZ_QUESTIONS_MAIN_ROUTE))
        .send(newQuestion)
        .expect(201);

      await setBasicAuthToken(
        request(app.getHttpServer()).delete(`/${SA_QUIZ_QUESTIONS_MAIN_ROUTE}/${response.body.id}`),
      ).expect(HttpStatus.NO_CONTENT);
    });
  });

  describe(methods.updateQuestion, () => {
    const updateQuestionData: UpdateQuizQuestionDto = {
      body: 'Text question',
      correctAnswers: ['Answer 1'],
    };

    it('(404) should return a 404 status code if the question was not found', async () => {
      await setBasicAuthToken(request(app.getHttpServer()).put(`/${SA_QUIZ_QUESTIONS_MAIN_ROUTE}/1000`))
        .send(updateQuestionData)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('(401) should return a 401 status code if user has not been authorized', async () => {
      await request(app.getHttpServer()).put(`/${SA_QUIZ_QUESTIONS_MAIN_ROUTE}/1`).expect(HttpStatus.UNAUTHORIZED);
    });

    it.each([[null], [], [{}, {}]])(
      "(400) should return a 400 status code if the correctAnswer field doesn't contain a number or string",
      async (...body) => {
        await setBasicAuthToken(request(app.getHttpServer()).post('/' + SA_QUIZ_QUESTIONS_MAIN_ROUTE))
          .send({
            body: '',
            correctAnswers: body,
          })
          .expect(HttpStatus.BAD_REQUEST)
          .expect(({ body }) => {
            expect(body).toMatchObject({
              errorsMessages: [
                { field: 'body', message: expect.any(String) },
                { field: 'correctAnswers', message: expect.any(String) },
              ],
            });
          });
      },
    );

    it('(204) should return a 204 status code if the question has been successfully updated', async () => {
      const response = await setBasicAuthToken(request(app.getHttpServer()).post('/' + SA_QUIZ_QUESTIONS_MAIN_ROUTE))
        .send(newQuestion)
        .expect(201);

      await setBasicAuthToken(request(app.getHttpServer()).put(`/${SA_QUIZ_QUESTIONS_MAIN_ROUTE}/${response.body.id}`))
        .send(updateQuestionData)
        .expect(HttpStatus.NO_CONTENT);
    });
  });

  describe(methods.updatePublished, () => {
    it('(404) should return a 404 status code if the question was not found', async () => {
      await setBasicAuthToken(request(app.getHttpServer()).put(`/${SA_QUIZ_QUESTIONS_MAIN_ROUTE}/1000/publish`))
        .send({ published: true })
        .expect(HttpStatus.NOT_FOUND);
    });

    it('(401) should return a 401 status code if user has not been authorized', async () => {
      await request(app.getHttpServer())
        .put(`/${SA_QUIZ_QUESTIONS_MAIN_ROUTE}/1/publish`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it.each([null, [], 'string'])(
      '(400) should return a 400 status code if the request body is incorrect',
      async (...cases) => {
        await setBasicAuthToken(request(app.getHttpServer()).put(`/${SA_QUIZ_QUESTIONS_MAIN_ROUTE}/1/publish`))
          .send({ published: cases })
          .expect(({ body }) => {
            expect(body).toMatchObject({
              errorsMessages: [{ field: 'published', message: expect.any(String) }],
            });
          });
      },
    );

    it('(204) should return a 204 status code if the question has been published', async () => {
      const response = await setBasicAuthToken(request(app.getHttpServer()).post('/' + SA_QUIZ_QUESTIONS_MAIN_ROUTE))
        .send(newQuestion)
        .expect(201);

      await setBasicAuthToken(
        request(app.getHttpServer()).put(`/${SA_QUIZ_QUESTIONS_MAIN_ROUTE}/${response.body.id}/publish`),
      )
        .send({ published: true })
        .expect(HttpStatus.NO_CONTENT);

      await setBasicAuthToken(
        request(app.getHttpServer()).put(`/${SA_QUIZ_QUESTIONS_MAIN_ROUTE}/${response.body.id}/publish`),
      )
        .send({ published: false })
        .expect(HttpStatus.NO_CONTENT);
    });
  });
});
