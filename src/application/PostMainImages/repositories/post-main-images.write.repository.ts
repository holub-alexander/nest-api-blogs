import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import PostMainImagesEntity from '../../../db/entities/post-main-images.entity';

@Injectable()
export class PostMainImagesWriteRepository extends Repository<PostMainImagesEntity> {
  constructor(private dataSource: DataSource) {
    super(PostMainImagesEntity, dataSource.createEntityManager());
  }
}
