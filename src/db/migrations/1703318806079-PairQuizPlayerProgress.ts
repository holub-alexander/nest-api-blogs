import { MigrationInterface, QueryRunner } from 'typeorm';

export class PairQuizPlayerProgress1703318806079 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE pair_quiz_player_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) NOT NULL,
        pair_quiz_id INTEGER REFERENCES pair_quiz_games(id) NOT NULL,
        score INTEGER DEFAULT 0 NOT NULL
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
