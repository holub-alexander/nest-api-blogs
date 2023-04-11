import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '@/entity/user.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SecurityDevicesQueryRepository {
  constructor(@InjectModel(User.name) private readonly UserModel: Model<UserDocument>) {}

  public async getUserByDeviceId(deviceId: string) {
    return this.UserModel.findOne<UserDocument>({ 'refreshTokensMeta.deviceId': deviceId });
  }
}
