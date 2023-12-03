import type { DataSource } from 'typeorm';
import BlogEntity from '../../entities/typeorm/blog.entity';
import { SeederFactoryManager, Seeder } from 'typeorm-extension';

export class MainSeeder implements Seeder {
  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<void> {
    const blogFactory = await factoryManager.get(BlogEntity);

    await blogFactory.saveMany(10);
  }
}
