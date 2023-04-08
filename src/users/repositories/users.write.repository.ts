import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { UsersQueryRepository } from '@/users/repositories/users.query.repository';
import { User, UserDocument } from '@/entity/user.entity';

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

  public async save(user: UserDocument) {
    await user.save();
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
}
