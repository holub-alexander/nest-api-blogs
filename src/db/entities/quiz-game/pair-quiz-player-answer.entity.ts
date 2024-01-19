import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import PairQuizGameEntity from './pair-quiz-game.entity';
import PairQuizGameQuestionEntity from './pair-quiz-game-question.entity';
import PairQuizPlayerProgressEntity from './pair-quiz-player-progress.entity';
import { PairQuizGameAnswerStatuses } from '../../../common/interfaces';

@Entity({ name: 'pair_quiz_player_answers' })
class PairQuizPlayerAnswerEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => PairQuizGameEntity)
  @JoinColumn({ name: 'pair_quiz_id', referencedColumnName: 'id' })
  pair_quiz: PairQuizGameEntity;

  @ManyToOne(() => PairQuizGameQuestionEntity)
  @JoinColumn({ name: 'pair_question_id', referencedColumnName: 'id' })
  pair_question: PairQuizGameQuestionEntity;

  @ManyToOne(() => PairQuizPlayerProgressEntity, (progress) => progress.answers)
  @JoinColumn({ name: 'player_progress_id', referencedColumnName: 'id' })
  player_progress: PairQuizPlayerProgressEntity;

  @Column({
    type: 'enum',
    enum: PairQuizGameAnswerStatuses,
    nullable: false,
  })
  answer_status: PairQuizGameAnswerStatuses;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: false,
  })
  answer_body: string;

  @Column({
    type: 'timestamptz',
    nullable: false,
    default: new Date(),
  })
  added_at: Date;
}

export default PairQuizPlayerAnswerEntity;
