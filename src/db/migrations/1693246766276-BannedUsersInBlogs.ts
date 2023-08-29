import { MigrationInterface, QueryRunner } from 'typeorm';

export class BannedUsersInBlogs1693246766276 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE banned_users_in_blogs (
                id SERIAL PRIMARY KEY,
                blog_id INTEGER NOT NULL REFERENCES blogs(id),
                user_id INTEGER NOT NULL REFERENCES users(id),
                is_banned BOOLEAN NOT NULL DEFAULT FALSE,
                ban_reason VARCHAR(200) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE banned_users_in_blogs');
  }
}
