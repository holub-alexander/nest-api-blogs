import { MigrationInterface, QueryRunner } from 'typeorm';

export class ReactionsTable1692429778716 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE reaction_subjects AS ENUM('comment', 'post');
            CREATE TYPE reaction_types AS ENUM('Like', 'Dislike', 'None');

            CREATE TABLE reactions (
               id SERIAL PRIMARY KEY,
               type reaction_subjects NOT NULL,
               comment_id INTEGER REFERENCES comments(id) ON DELETE CASCADE DEFAULT NULL,
               post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE DEFAULT NULL,
               user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
               created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
               like_status reaction_types DEFAULT 'None' NOT NULL
           );
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE reactions;
        DROP TYPE reaction_subjects;
        DROP TYPE reaction_types;
    `);
  }
}
