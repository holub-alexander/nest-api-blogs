import { MigrationInterface, QueryRunner } from 'typeorm';

export class QuizQuestionsTable1703316048732 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE quiz_questions (
                id SERIAL PRIMARY KEY,
                body VARCHAR(300) DEFAULT NULL,
                correct_answers JSONB DEFAULT NULL,
                published BOOLEAN DEFAULT FALSE NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
                updated_at TIMESTAMP WITH TIME ZONE NOT NULL
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE quiz_questions;
      `);
  }
}
