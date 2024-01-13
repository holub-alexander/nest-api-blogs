import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import QuizQuestionEntity from '../../../db/entities/quiz-game/quiz-question.entity';
import { UpdateQuizQuestionDto } from '../dto/update.dto';

@Injectable()
export class QuizQuestionsWriteRepository {
  constructor(
    @InjectRepository(QuizQuestionEntity)
    private readonly quizQuestionRepository: Repository<QuizQuestionEntity>,
  ) {}

  public create() {
    return this.quizQuestionRepository.create();
  }

  public async save(createdQuizQuestion: QuizQuestionEntity): Promise<QuizQuestionEntity | null> {
    return this.quizQuestionRepository.save(createdQuizQuestion);
  }

  public async deleteOne(id: string) {
    if (!id || !Number.isInteger(+id)) {
      return false;
    }

    const res = await this.quizQuestionRepository.delete({ id: +id });

    return !res.affected ? false : res.affected > 0;
  }

  public async updateOne(id: string, data: UpdateQuizQuestionDto) {
    if (!id || !Number.isInteger(+id)) {
      return false;
    }

    const res = await this.quizQuestionRepository.update(
      { id: +id },
      {
        body: data.body,
        correct_answers: data.correctAnswers,
      },
    );

    return !res.affected ? false : res.affected > 0;
  }

  public async updatePublishStatus(id: string, publish: boolean) {
    const res = await this.quizQuestionRepository.update(
      { id: +id },
      {
        published: publish,
      },
    );

    return !res.affected ? false : res.affected > 0;
  }
}
