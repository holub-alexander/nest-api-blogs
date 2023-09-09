import { MigrationInterface, QueryRunner } from 'typeorm';

export class CommentsTable1692429687398 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE comments (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
                blog_id INTEGER REFERENCES blogs(id) ON DELETE CASCADE NOT NULL,
                post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                content VARCHAR(200)
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE comments`);
  }
}
