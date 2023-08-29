import { MigrationInterface, QueryRunner } from 'typeorm';

export class CommentsTable1692429687398 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE comments (
                id SERIAL PRIMARY KEY,
                title VARCHAR(100)
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE comments`);
  }
}
