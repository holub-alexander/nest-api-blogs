import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import UserEntity from '../user.entity';
import PairQuizGameEntity from './pair-quiz-game.entity';

@Entity({ name: 'pair_quiz_player_progress' })
class PairQuizPlayerProgressEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.pair_quiz_player_progresses)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: UserEntity;

  @ManyToOne(() => PairQuizGameEntity)
  @JoinColumn({ name: 'pair_quiz_id', referencedColumnName: 'id' })
  pair_quiz_game: PairQuizGameEntity;

  @Column({
    type: 'smallint',
    nullable: false,
    default: 0,
  })
  score: number;
}

export default PairQuizPlayerProgressEntity;
