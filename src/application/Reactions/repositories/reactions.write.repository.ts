import { LikeStatuses } from '../../../common/interfaces';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import ReactionEntity from '../../../db/entities/reaction.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ReactionsWriteRepository {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(ReactionEntity) private readonly reactionRepository: Repository<ReactionEntity>,
  ) {}

  public async create() {
    return this.reactionRepository.create();
  }

  public async save(reaction: ReactionEntity): Promise<ReactionEntity | null> {
    return this.reactionRepository.save(reaction);
  }

  public async updateLikeStatus(reactionId: number, likeStatus: LikeStatuses): Promise<boolean> {
    const res = await this.reactionRepository.update({ id: reactionId }, { like_status: likeStatus });

    return !res.affected ? false : res.affected > 0;
  }

  public async deleteMany(): Promise<boolean> {
    const res = await this.reactionRepository.delete({});

    return !res.affected ? false : res.affected > 0;
  }
}
