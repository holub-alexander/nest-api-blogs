import { MigrationInterface, QueryRunner } from 'typeorm';

export class PairQuizGameQuestions1703318389024 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE pair_quiz_game_questions (
                id SERIAL PRIMARY KEY,
                pair_quiz_game_id INTEGER REFERENCES pair_quiz_games(id) NOT NULL,
                quiz_question_id INTEGER REFERENCES quiz_questions(id) NOT NULL
            );
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE pair_quiz_game_questions;
    `);
  }
}
