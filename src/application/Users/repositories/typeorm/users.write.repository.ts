import { Injectable } from '@nestjs/common';
import UserEntityTypeOrm from '../../../../db/entities/typeorm/user.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class UsersTypeOrmWriteRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  public async create(createUserDto: UserEntityTypeOrm): Promise<UserEntityTypeOrm | null> {
    const result = await this.dataSource.query(
      `
      INSERT INTO users (
        email,
        login,
        password,
        created_at,
        confirmation_code,
        expiration_date,
        is_confirmed,
        recovery_code
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *;
    `,
      [
        createUserDto.email,
        createUserDto.login,
        createUserDto.password,
        createUserDto.created_at,
        createUserDto.confirmation_code,
        createUserDto.expiration_date,
        createUserDto.is_confirmed,
        createUserDto.recovery_code,
      ],
    );

    return result[0] || null;
  }

  public async deleteOne(userId: string): Promise<boolean> {
    if (!userId || !Number.isInteger(+userId)) {
      return false;
    }

    const result = await this.dataSource.query(
      `
      DELETE FROM users
      WHERE id = $1
    `,
      [userId],
    );

    return result[1] > 0;
  }

  public async deleteMany(): Promise<boolean> {
    const result = await this.dataSource.query(`
      DELETE FROM users
      WHERE id > 0;
    `);

    return result[1] > 0;
  }

  public async confirmRegistration(id: number): Promise<boolean> {
    const result = await this.dataSource.query<[UserEntityTypeOrm[], number]>(
      `
      UPDATE users
      SET confirmation_code = NULL,
          is_confirmed = true
      WHERE id = $1
      RETURNING *;
    `,
      [id],
    );

    return result[1] > 0;
  }

  public async updateConfirmationCode(
    id: number,
    { confirmationCode, expirationDate }: { confirmationCode: string; expirationDate: Date },
  ): Promise<boolean> {
    if (!id || !Number.isInteger(+id)) {
      return false;
    }

    const result = await this.dataSource.query<[UserEntityTypeOrm[], number]>(
      `
      UPDATE users
      SET confirmation_code = $2,
          expiration_date = $3
      WHERE id = $1
      RETURNING *;
    `,
      [id, confirmationCode, expirationDate],
    );

    return result[1] > 0;
  }

  async passwordRecovery(userId: number, recoveryCode: string): Promise<boolean> {
    if (!userId || !Number.isInteger(+userId)) {
      return false;
    }

    const result = await this.dataSource.query<[[], number]>(
      `
      UPDATE users
      SET recovery_code = $2
      WHERE id = $1;
    `,
      [userId, recoveryCode],
    );

    return result[1] > 0;
  }

  public async confirmPasswordRecovery({
    recoveryCode,
    passwordHash,
  }: {
    passwordHash: string;
    recoveryCode: string;
  }): Promise<boolean> {
    const result = await this.dataSource.query<[[], number]>(
      `
      UPDATE users
      SET recovery_code = NULL,
          password = $2
      WHERE recovery_code = $1;
    `,
      [recoveryCode, passwordHash],
    );

    return result[1] > 0;
  }

  public async banUnban(
    userId: string,
    isBanned: boolean,
    banReason: string | null,
    banDate: Date | null,
  ): Promise<boolean> {
    if (!userId || !Number.isInteger(+userId)) {
      return false;
    }

    const result = await this.dataSource.query<[[], number]>(
      `
      UPDATE users
      SET is_banned = $2,
          ban_reason = $3,
          ban_date = $4
      WHERE id = $1;
    `,
      [userId, isBanned, banReason, banDate],
    );

    return result[1] > 0;
  }
}
