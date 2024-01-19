import { MigrationInterface, QueryRunner } from 'typeorm';

export class PairQuizGameQuestions1703318389024 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE pair_quiz_game_questions (
                id SERIAL PRIMARY KEY,
                pair_quiz_game_id INTEGER NOT NULL REFERENCES pair_quiz_games(id) ON DELETE CASCADE,
                quiz_question_id INTEGER NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE
            );
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE pair_quiz_game_questions;
    `);
  }
}
