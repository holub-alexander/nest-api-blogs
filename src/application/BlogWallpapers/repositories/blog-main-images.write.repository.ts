import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import BlogMainImagesEntity from '../../../db/entities/blog-main-images.entity';

@Injectable()
export class BlogMainImagesWriteRepository extends Repository<BlogMainImagesEntity> {
  constructor(private dataSource: DataSource) {
    super(BlogMainImagesEntity, dataSource.createEntityManager());
  }
}
