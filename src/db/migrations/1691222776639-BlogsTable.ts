import { MigrationInterface, QueryRunner } from 'typeorm';

export class BlogsTable1691222776639 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE blogs (
                id SERIAL PRIMARY KEY,
                name VARCHAR(300),
                description VARCHAR(1000),
                website_url VARCHAR(300),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
                is_membership BOOLEAN DEFAULT FALSE NOT NULL,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                ban_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
                is_banned BOOLEAN DEFAULT FALSE NOT NULL
            );
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE blogs;
      `);
  }
}
