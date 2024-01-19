import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import PairQuizGameEntity from '../../../../db/entities/quiz-game/pair-quiz-game.entity';

@Injectable()
export class PairQuizPlayerProgressQueryRepository {
  constructor(
    @InjectRepository(PairQuizGameEntity) private readonly pairQuizGameRepository: Repository<PairQuizGameEntity>,
  ) {}

  public async findOne(id: number) {
    return this.pairQuizGameRepository.findBy({ id });
  }
}
