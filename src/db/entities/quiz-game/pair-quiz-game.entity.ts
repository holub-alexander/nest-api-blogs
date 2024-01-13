import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PairQuizGameStatuses } from '../../../common/interfaces';
import PairQuizPlayerProgressEntity from './pair-quiz-player-progress.entity';
import PairQuizPlayerAnswerEntity from './pair-quiz-player-answer.entity';

@Entity({ name: 'pair_quiz_games' })
class PairQuizGameEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => PairQuizPlayerProgressEntity)
  @JoinColumn()
  first_player_progress_id: PairQuizPlayerProgressEntity;

  @OneToOne(() => PairQuizPlayerProgressEntity)
  @JoinColumn()
  second_player_progress_id: PairQuizPlayerProgressEntity;

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

  /**
   * Relation to pair quiz player progress
   * */
  // @OneToMany(() => PairQuizPlayerProgressEntity, (quizPlayerProgress) => quizPlayerProgress.user, {
  //   onDelete: 'CASCADE',
  // })
  // pair_quiz_player_progresses: PairQuizPlayerProgressEntity[];

  @OneToMany(() => PairQuizPlayerAnswerEntity, (quizPlayerAnswer) => quizPlayerAnswer.pair_quiz, {
    onDelete: 'CASCADE',
  })
  pair_quiz_player_answers: PairQuizPlayerAnswerEntity[];
}

export default PairQuizGameEntity;
