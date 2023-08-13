import { MigrationInterface, QueryRunner } from 'typeorm';

export class PostsTable1691913366095 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE posts (
                id SERIAL PRIMARY KEY,
                title VARCHAR(30) NOT NULL,
                short_description VARCHAR(100) NOT NULL,
                content VARCHAR(1000) NOT NULL,
                blog_id INTEGER REFERENCES blogs(id) ON DELETE CASCADE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
                is_banned BOOLEAN DEFAULT FALSE NOT NULL,
                likes_count INTEGER DEFAULT 0 NOT NULL,
                dislikes_count INTEGER DEFAULT 0 NOT NULL,
                user_id INTEGER REFERENCES users(id) NOT NULL
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE posts');
  }
}
