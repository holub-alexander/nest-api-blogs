import { DataSource, Repository } from 'typeorm';
import PairQuizPlayerAnswerEntity from '../../../../db/entities/quiz-game/pair-quiz-player-answer.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PairQuizPlayerAnswersWriteRepository extends Repository<PairQuizPlayerAnswerEntity> {
  constructor(private dataSource: DataSource) {
    super(PairQuizPlayerAnswerEntity, dataSource.createEntityManager());
  }
}
