import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import UserEntity from '../user.entity';
import PairQuizPlayerAnswerEntity from './pair-quiz-player-answer.entity';

@Entity({ name: 'pair_quiz_player_progress' })
class PairQuizPlayerProgressEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.pair_quiz_player_progresses, { eager: true, cascade: true })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: UserEntity;

  @Column({
    type: 'smallint',
    nullable: false,
    default: 0,
  })
  score: number;

  @OneToMany(() => PairQuizPlayerAnswerEntity, (quizPlayerAnswer) => quizPlayerAnswer.player_progress, {
    onDelete: 'CASCADE',
    eager: true,
  })
  answers: PairQuizPlayerAnswerEntity[];

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
}

export default PairQuizPlayerProgressEntity;
