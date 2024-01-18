import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import PairQuizGameQuestionEntity from '../../../../db/entities/quiz-game/pair-quiz-game-question.entity';

@Injectable()
export class PairQuizQuestionsWriteRepository extends Repository<PairQuizGameQuestionEntity> {
  constructor(private dataSource: DataSource) {
    super(PairQuizGameQuestionEntity, dataSource.createEntityManager());
  }

  public async insertWithTransactions(data: PairQuizGameQuestionEntity[], transactionManager?: EntityManager) {
    if (transactionManager) {
      return transactionManager.insert(PairQuizGameQuestionEntity, data);
    }

    return this.insert(data);
  }
}
