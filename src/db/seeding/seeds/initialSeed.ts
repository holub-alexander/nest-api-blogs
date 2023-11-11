import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm';
import Users from '../../entities/typeorm/user.entity';
import DeviceEntity from '../../entities/typeorm/device.entity';
import BlogEntityTypeOrm from '../../entities/typeorm/blog.entity';
import PostEntityTypeOrm from '../../entities/typeorm/post.entity';

export default class InitialDatabaseSeed implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<void> {
    const users = await factory(Users)().createMany(15);

    await factory(DeviceEntity)()
      .map(async (device) => {
        device.user = users[1];

        return device;
      })
      .createMany(4);

    await factory(BlogEntityTypeOrm)().createMany(11);
    await factory(PostEntityTypeOrm)().createMany(10);
  }
}
