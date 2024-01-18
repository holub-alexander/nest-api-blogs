import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import QuizQuestionEntity from './quiz-question.entity';
import PairQuizGameEntity from './pair-quiz-game.entity';

@Entity({ name: 'pair_quiz_game_questions' })
class PairQuizGameQuestionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  pair_quiz_game_id: number;

  @ManyToOne(() => QuizQuestionEntity, (question) => question.id, { eager: true })
  @JoinColumn({ name: 'quiz_question_id', referencedColumnName: 'id' })
  question: QuizQuestionEntity;

  @ManyToOne(() => PairQuizGameEntity, (quiz) => quiz.quiz_questions)
  @JoinColumn({ name: 'pair_quiz_game_id', referencedColumnName: 'id' })
  pair_quiz_game: PairQuizGameEntity;
}

export default PairQuizGameQuestionEntity;
