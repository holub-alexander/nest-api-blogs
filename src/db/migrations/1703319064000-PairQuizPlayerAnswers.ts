import { MigrationInterface, QueryRunner } from 'typeorm';

export class PairQuizPlayerAnswers1703319064000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE pair_quiz_game_answer_statuses AS ENUM('correct', 'incorrect');

            CREATE TABLE pair_quiz_player_answers (
                id SERIAL PRIMARY KEY,
                pair_quiz_id INTEGER REFERENCES pair_quiz_games(id) ON DELETE CASCADE,
                pair_question_id INTEGER REFERENCES pair_quiz_game_questions(id) ON DELETE CASCADE,
                player_progress_id INTEGER REFERENCES pair_quiz_player_progress(id) ON DELETE CASCADE,
                answer_status pair_quiz_game_answer_statuses NOT NULL,
                answer_body VARCHAR(500) NOT NULL,
                added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
            );
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE pair_quiz_player_answers;
        DROP TYPE pair_quiz_game_answer_statuses;
      `);
  }
}
