import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BanUser, BanUserEntity } from '../../db/entities/mongoose/ban-user.entity';
import { BanUserWriteRepository } from './repositories/ban-user.write.repository';

@Module({
  imports: [MongooseModule.forFeature([{ name: BanUser.name, schema: BanUserEntity }])],
  providers: [BanUserWriteRepository],
  controllers: [],
})
export class BanUserModule {}
