import { Injectable } from '@nestjs/common';
import { UpdatePostDto } from '../dto/update.dto';

import PostEntity from '../../../db/entities/typeorm/post.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PostsWriteRepository {
  constructor(@InjectRepository(PostEntity) private readonly postRepository: Repository<PostEntity>) {}

  public create() {
    return this.postRepository.create();
  }

  public async save(createdPost: PostEntity): Promise<PostEntity | null> {
    const savedPost = await this.postRepository.save(createdPost);

    return this.postRepository.findOne({
      where: { id: savedPost.id },
      relations: ['blog'],
    });
  }

  public async deleteOne(postId: string): Promise<boolean> {
    if (!postId || !Number.isInteger(+postId)) {
      return false;
    }

    const res = await this.postRepository.delete({ id: +postId });

    return !res.affected ? false : res.affected > 0;
  }

  public async updateOne(postId: string, data: UpdatePostDto): Promise<boolean> {
    if (!postId || !Number.isInteger(+postId)) {
      return false;
    }

    const res = await this.postRepository.update(
      { id: +postId },
      {
        title: data.title,
        short_description: data.shortDescription,
        content: data.content,
      },
    );

    return !res.affected ? false : res.affected > 0;
  }

  public async deleteMany(): Promise<boolean> {
    const res = await this.postRepository.delete({});

    return !res.affected ? false : res.affected > 0;
  }
}
