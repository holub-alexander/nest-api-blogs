import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { BanUser, BanUserDocument } from '../../../entity/ban-user.entity';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';

@Injectable()
export class BanUserWriteRepository {
  constructor(@InjectModel(BanUser.name) private readonly BanUserModel: Model<BanUserDocument>) {}

  public async banUserForBlog(doc: BanUserDocument): Promise<BanUserDocument> {
    return doc.save();
  }

  public async unbanUserForBlog(userId: ObjectId, blogId: ObjectId) {
    return this.BanUserModel.deleteOne({ blogId, 'user.id': userId });
  }
}
