import { MigrationInterface, QueryRunner } from 'typeorm';

export class UsersTable1690010801165 implements MigrationInterface {
  name = 'UsersTable1690010801165';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                login VARCHAR(300) NOT NULL,
                password VARCHAR(300) NOT NULL,
                email VARCHAR(300) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
                
                is_banned BOOLEAN DEFAULT FALSE,
                ban_reason VARCHAR(1000) DEFAULT NULL,
                ban_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
                
                confirmation_code VARCHAR(1000) DEFAULT NULL,
                expiration_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
                is_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
                
                recovery_code VARCHAR(1000) DEFAULT NULL
            );
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE users;
      `);
  }
}
