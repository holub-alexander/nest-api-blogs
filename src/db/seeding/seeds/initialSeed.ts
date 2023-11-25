import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm';
import Users from '../../entities/typeorm/user.entity';
import DeviceEntity from '../../entities/typeorm/device.entity';
import BlogEntity from '../../entities/typeorm/blog.entity';
import PostEntity from '../../entities/typeorm/post.entity';

export default class InitialDatabaseSeed implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<void> {
    const users = await factory(Users)().createMany(15);

    await factory(DeviceEntity)()
      .map(async (device) => {
        device.user = users[1];

        return device;
      })
      .createMany(4);

    await factory(BlogEntity)().createMany(11);
    await factory(PostEntity)().createMany(10);
  }
}
