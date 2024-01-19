import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import PairQuizGameEntity from '../../../../db/entities/quiz-game/pair-quiz-game.entity';

@Injectable()
export class PairQuizGamesWriteRepository extends Repository<PairQuizGameEntity> {
  constructor(private dataSource: DataSource) {
    super(PairQuizGameEntity, dataSource.createEntityManager());
  }

  public async saveWithTransactions(
    data: PairQuizGameEntity,
    transactionManager: EntityManager,
  ): Promise<PairQuizGameEntity> {
    if (transactionManager) {
      return transactionManager.save(data);
    }

    return this.save(data);
  }

  public async updateWithTransactions(
    id: number,
    data: Partial<PairQuizGameEntity>,
    transactionManager: EntityManager,
  ) {
    return transactionManager.update(PairQuizGameEntity, { id: +id }, data);
  }

  public async deleteMany(): Promise<boolean> {
    const res = await this.delete({});

    return !res.affected ? false : res.affected > 0;
  }
}
