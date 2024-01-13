import { MigrationInterface, QueryRunner } from 'typeorm';

export class PairQuizGamesTable1703315416821 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE pair_quiz_game_statuses AS ENUM('pending_second_player', 'active', 'finished');

            CREATE TABLE pair_quiz_games (
                id SERIAL PRIMARY KEY,
                status pair_quiz_game_statuses NOT NULL,
                pair_created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
                start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
                finish_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE pair_quiz_games;
        DROP TYPE pair_quiz_game_statuses;
      `);
  }
}
