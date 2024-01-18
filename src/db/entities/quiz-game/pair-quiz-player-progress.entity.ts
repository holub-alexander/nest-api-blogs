import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import UserEntity from '../user.entity';

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
}

export default PairQuizPlayerProgressEntity;
