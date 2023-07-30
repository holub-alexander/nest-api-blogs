import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { User, UserDocument } from '../../../../db/entities/mongoose/user.entity';

@Injectable()
export class SecurityDevicesQueryRepository {
  constructor(@InjectModel(User.name) private readonly UserModel: Model<UserDocument>) {}

  public async findUserByDeviceId(deviceId: string): Promise<User | null> {
    return this.UserModel.findOne<User>({ 'refreshTokensMeta.deviceId': deviceId });
  }
}
