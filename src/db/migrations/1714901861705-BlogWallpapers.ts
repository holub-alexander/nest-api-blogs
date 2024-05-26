import { MigrationInterface, QueryRunner } from 'typeorm';

export class BlogWallpapers1714901861705 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE blog_wallpapers (
                id SERIAL PRIMARY KEY,
                blog_id INT NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
                width INT NOT NULL,
                height INT NOT NULL,
                file_size_in_bytes INT NOT NULL,
                file_name VARCHAR(1000) NOT NULL,
                file_path VARCHAR(500) NOT NULL,
                bucket_name VARCHAR(50) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE blog_wallpapers;
        `);
  }
}
