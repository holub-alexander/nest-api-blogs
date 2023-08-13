import { MigrationInterface, QueryRunner } from 'typeorm';

export class DevicesTable1690013311285 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE devices (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                ip VARCHAR(50) NOT NULL,
                title VARCHAR(1000) DEFAULT NULL,
                device_id VARCHAR(50) NOT NULL,
                issued_at TIMESTAMP WITH TIME ZONE NOT NULL,
                expiration_date TIMESTAMP WITH TIME ZONE NOT NULL
            );
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE devices;
    `);
  }
}
