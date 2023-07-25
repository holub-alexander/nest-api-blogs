import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm';
import Users from '../../entities/typeorm/user.entity';
import DeviceEntityTypeOrm from '../../entities/typeorm/device.entity';

export default class InitialDatabaseSeed implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<void> {
    const users = await factory(Users)().createMany(15);

    await factory(DeviceEntityTypeOrm)()
      .map(async (device) => {
        device.user = users[1];

        return device;
      })
      .createMany(4);
  }
}