import { MigrationInterface, QueryRunner } from 'typeorm';

export class PairQuizPlayerProgress1703318806079 implements MigrationInterface {
  // pair_quiz_id INTEGER REFERENCES pair_quiz_games(id) NOT NULL,

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE pair_quiz_player_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        score INTEGER DEFAULT 0 NOT NULL,
        start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
        finish_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
      );
      
      ALTER TABLE pair_quiz_games
      ADD COLUMN first_player_progress_id INTEGER REFERENCES pair_quiz_player_progress(id) ON DELETE CASCADE,
      ADD COLUMN second_player_progress_id INTEGER REFERENCES pair_quiz_player_progress(id) ON DELETE CASCADE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE pair_quiz_player_progress;
    `);
  }
}
