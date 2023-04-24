import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { User, UserDocument } from '../../../entity/user.entity';
import { UsersQueryRepository } from './users.query.repository';

@Injectable()
export class UsersWriteRepository {
  constructor(
    private usersQueryRepository: UsersQueryRepository,
    @InjectModel(User.name) private UserModel: Model<UserDocument>,
  ) {}

  public async create(createUserDto: UserDocument): Promise<UserDocument | null> {
    const res = await this.UserModel.insertMany(createUserDto, {});

    if (res) {
      return createUserDto;
    }

    return null;
  }

  public async save(user: UserDocument): Promise<UserDocument> {
    return user.save();
  }

  public async deleteOne(userId: string): Promise<boolean> {
    const isValidId = ObjectId.isValid(userId);

    if (isValidId) {
      const res = await this.UserModel.deleteOne({ _id: new ObjectId(userId) });
      return res.deletedCount > 0;
    }

    return false;
  }

  public async deleteMany(): Promise<boolean> {
    const res = await this.UserModel.deleteMany({});
    return res.deletedCount > 0;
  }

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

  public async banUnban(userId: ObjectId, isBanned: boolean, banReason: string | null) {
    const res = await this.UserModel.updateOne(
      { _id: userId },
      { 'accountData.isBanned': isBanned, 'accountData.banReason': banReason },
    );

    return res.modifiedCount === 1;
  }
}
