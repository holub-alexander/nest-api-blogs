import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { User, UserDocument } from '../../entity/user.entity';

@Injectable()
export class SecurityDevicesQueryRepository {
  constructor(@InjectModel(User.name) private readonly UserModel: Model<UserDocument>) {}

  public async findUserByDeviceId(deviceId: string) {
    return this.UserModel.findOne<UserDocument>({ 'refreshTokensMeta.deviceId': deviceId });
  }
}
