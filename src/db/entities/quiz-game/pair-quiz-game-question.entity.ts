import { Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import QuizQuestionEntity from './quiz-question.entity';
import PairQuizGameEntity from './pair-quiz-game.entity';
import PairQuizPlayerAnswerEntity from './pair-quiz-player-answer.entity';

@Entity({ name: 'pair_quiz_game_questions' })
class PairQuizGameQuestionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToMany(() => QuizQuestionEntity, (question) => question.id)
  @JoinTable({ name: 'quiz_question_id' })
  questions: QuizQuestionEntity[];

  @ManyToMany(() => PairQuizGameEntity, (quiz) => quiz.id)
  @JoinTable({ name: 'pair_quiz_game_id' })
  quiz_games: PairQuizGameEntity[];

  @OneToMany(() => PairQuizPlayerAnswerEntity, (quizQuestion) => quizQuestion.pair_question, {
    onDelete: 'CASCADE',
  })
  pair_quiz_questions: PairQuizPlayerAnswerEntity[];
}

export default PairQuizGameQuestionEntity;
