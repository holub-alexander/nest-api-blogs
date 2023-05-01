import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BanUser, BanUserDocument } from '../../../entity/ban-user.entity';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';

@Injectable()
export class BanUserQueryRepository {
  constructor(@InjectModel(BanUser.name) private readonly BanUserModel: Model<BanUserDocument>) {}

  public async findBanForBlog(userId: ObjectId, blogId: ObjectId) {
    return this.BanUserModel.findOne({ 'user.id': userId, blogId });
  }
}
