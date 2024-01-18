import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PairQuizGameStatuses } from '../../../common/interfaces';
import PairQuizPlayerProgressEntity from './pair-quiz-player-progress.entity';
import PairQuizGameQuestionEntity from './pair-quiz-game-question.entity';

@Entity({ name: 'pair_quiz_games' })
class PairQuizGameEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => PairQuizPlayerProgressEntity, { eager: true, cascade: true })
  @JoinColumn({ name: 'first_player_progress_id', referencedColumnName: 'id' })
  first_player_progress: PairQuizPlayerProgressEntity;

  @OneToOne(() => PairQuizPlayerProgressEntity, { eager: true, cascade: true })
  @JoinColumn({ name: 'second_player_progress_id', referencedColumnName: 'id' })
  second_player_progress: PairQuizPlayerProgressEntity | null;

  @Column({
    type: 'enum',
    enum: PairQuizGameStatuses,
    nullable: false,
    default: PairQuizGameStatuses.PendingSecondPlayer,
  })
  status: PairQuizGameStatuses;

  @Column({
    type: 'timestamptz',
    nullable: false,
    default: new Date(),
  })
  pair_created_at: Date;

  @Column({
    type: 'timestamptz',
    default: null,
  })
  start_date: Date;

  @Column({
    type: 'timestamptz',
    default: null,
  })
  finish_date: Date;

  // @OneToMany(() => PairQuizPlayerAnswerEntity, (quizPlayerAnswer) => quizPlayerAnswer.pair_quiz, {
  //   onDelete: 'CASCADE',
  // })
  // pair_quiz_player_answers: PairQuizPlayerAnswerEntity[];

  @OneToMany(() => PairQuizGameQuestionEntity, (quizQuestion) => quizQuestion.pair_quiz_game, {
    onDelete: 'CASCADE',
    eager: true,
  })
  quiz_questions: PairQuizGameQuestionEntity[];
}

export default PairQuizGameEntity;
