import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import PairQuizPlayerProgressEntity from '../../../../db/entities/quiz-game/pair-quiz-player-progress.entity';

@Injectable()
export class PairQuizPlayerProgressWriteRepository extends Repository<PairQuizPlayerProgressEntity> {
  constructor(private dataSource: DataSource) {
    super(PairQuizPlayerProgressEntity, dataSource.createEntityManager());
  }

  public async saveWithTransactions(
    data: PairQuizPlayerProgressEntity,
    transactionManager: EntityManager,
  ): Promise<PairQuizPlayerProgressEntity> {
    if (transactionManager) {
      return transactionManager.save(data);
    }

    return this.save(data);
  }

  public async incrementScore(progressId: number) {
    return this.createQueryBuilder('pair_quiz_player_progress')
      .update(PairQuizPlayerProgressEntity)
      .set({ score: () => 'score + 1' })
      .where('id = :id', { id: progressId })
      .execute();
  }

  public async deleteMany(): Promise<boolean> {
    const res = await this.delete({});

    return !res.affected ? false : res.affected > 0;
  }
}
