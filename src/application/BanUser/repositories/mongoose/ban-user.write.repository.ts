import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { BanUser, BanUserDocument } from '../../../../db/entities/mongoose/ban-user.entity';

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
