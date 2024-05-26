import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import BlogWallpapersEntity from '../../../db/entities/blog-wallpapers.entity';

@Injectable()
export class BlogWallpapersWriteRepository extends Repository<BlogWallpapersEntity> {
  constructor(private dataSource: DataSource) {
    super(BlogWallpapersEntity, dataSource.createEntityManager());
  }
}
