import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import QuizQuestionEntity from '../../entities/quiz-game/quiz-question.entity';

export class PairQuizSeeder implements Seeder {
  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<void> {
    const quizQuestionFactory = await factoryManager.get(QuizQuestionEntity);

    await quizQuestionFactory.saveMany(40);
  }
}
