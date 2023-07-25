// @ts-nocheck

import { Injectable } from '@nestjs/common';
import UserEntityTypeOrm from '../../../../db/entities/typeorm/user.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ObjectId } from 'mongodb';
import { UserDocument } from '../../../../db/entities/mongoose/user.entity';

@Injectable()
export class UsersWriteRepository {
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

  /* TODO: TEST, REFACTOR */

  public async save(user: UserDocument): Promise<UserDocument> {
    return user.save();
  }

  /* === TODO: REFACTOR */

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

  /* TODO: TEST, REFACTOR */

  public async confirmRegistration(_id: ObjectId): Promise<boolean> {
    const res = await this.UserModel.updateOne({ _id }, { $set: { 'emailConfirmation.isConfirmed': true } });
    return res.modifiedCount === 1;
  }

  public async updateConfirmationCode(
    _id: ObjectId,
    { confirmationCode, expirationDate }: { confirmationCode: string; expirationDate: Date },
  ): Promise<boolean> {
    const res = await this.UserModel.updateOne(
      { _id },
      {
        $set: {
          'emailConfirmation.confirmationCode': confirmationCode,
          'emailConfirmation.expirationDate': expirationDate,
        },
      },
    );

    return res.modifiedCount === 1;
  }

  // @ts-ignore
  async passwordRecovery(userId: ObjectId, recoveryCode: string): Promise<boolean> {
    const res = await this.UserModel.updateOne(
      { _id: userId },
      {
        $set: {
          'passwordRecovery.recoveryCode': recoveryCode,
        },
      },
    );

    return res.modifiedCount === 1;
  }

  public async confirmPasswordRecovery({ recoveryCode, passwordHash }: { passwordHash: string; recoveryCode: string }) {
    const res = await this.UserModel.updateOne(
      { 'passwordRecovery.recoveryCode': recoveryCode },
      { $set: { 'passwordRecovery.recoveryCode': null, 'accountData.password': passwordHash } },
    );

    return res.modifiedCount === 1;
  }

  public async banUnban(userId: ObjectId, isBanned: boolean, banReason: string | null, banDate: string | null) {
    const res = await this.UserModel.updateOne(
      { _id: userId },
      { 'accountData.isBanned': isBanned, 'accountData.banReason': banReason, 'accountData.banDate': banDate },
    );

    return res.modifiedCount === 1;
  }
}
