import { MigrationInterface, QueryRunner } from 'typeorm';

export class PostMainImages1715017697076 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE size_variants AS ENUM('original', 'middle', 'small');

            CREATE TABLE post_main_images (
                id SERIAL PRIMARY KEY,
                blog_id INT NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
                post_id INT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
                size_variant size_variants NOT NULL,
                width INT NOT NULL,
                height INT NOT NULL,
                file_size_in_bytes INT NOT NULL,
                file_name VARCHAR(1000) NOT NULL,
                file_path VARCHAR(500) NOT NULL,
                bucket_name VARCHAR(50) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
            );
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE post_main_images;
            DROP TYPE size_variants;
        `);
  }
}
