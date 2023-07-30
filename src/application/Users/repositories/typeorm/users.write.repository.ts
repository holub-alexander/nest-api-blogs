// @ts-nocheck

import { Injectable } from '@nestjs/common';
import UserEntityTypeOrm from '../../../../db/entities/typeorm/user.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ObjectId } from 'mongodb';
import { UserDocument } from '../../../../db/entities/mongoose/user.entity';

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
        is_banned,
        ban_reason,
        ban_date,
        confirmation_code,
        expiration_date,
        is_confirmed,
        recovery_code
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING *;
    `,
      [
        createUserDto.email,
        createUserDto.login,
        createUserDto.password,
        createUserDto.created_at,
        createUserDto.is_banned,
        createUserDto.ban_reason,
        createUserDto.ban_date,
        createUserDto.confirmation_code,
        createUserDto.expiration_date,
        createUserDto.is_confirmed,
        createUserDto.recovery_code,
      ],
    );

    return result[0] || null;
  }

  public async save(user: UserDocument): Promise<UserDocument> {
    return user.save();
  }

  public async deleteOne(userId: string): Promise<boolean> {
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

    // const res = await this.UserModel.updateOne({ _id }, { $set: { 'emailConfirmation.isConfirmed': true } });

    return result[1] > 0;
  }

  public async updateConfirmationCode(
    id: number,
    { confirmationCode, expirationDate }: { confirmationCode: string; expirationDate: Date },
  ): Promise<boolean> {
    // const res = await this.UserModel.updateOne(
    //   { _id },
    //   {
    //     $set: {
    //       'emailConfirmation.confirmationCode': confirmationCode,
    //       'emailConfirmation.expirationDate': expirationDate,
    //     },
    //   },
    // );

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
    // const res = await this.UserModel.updateOne(
    //   { _id: userId },
    //   {
    //     $set: {
    //       'passwordRecovery.recoveryCode': recoveryCode,
    //     },
    //   },
    // );
    //
    // return res.modifiedCount === 1;

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
    // const res = await this.UserModel.updateOne(
    //   { 'passwordRecovery.recoveryCode': recoveryCode },
    //   { $set: { 'passwordRecovery.recoveryCode': null, 'accountData.password': passwordHash } },
    // );
    //
    // return res.modifiedCount === 1;

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

  public async banUnban(userId: ObjectId, isBanned: boolean, banReason: string | null, banDate: string | null) {
    const res = await this.UserModel.updateOne(
      { _id: userId },
      { 'accountData.isBanned': isBanned, 'accountData.banReason': banReason, 'accountData.banDate': banDate },
    );

    return res.modifiedCount === 1;
  }
}
