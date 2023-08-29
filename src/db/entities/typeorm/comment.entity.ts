import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import ReactionEntity from './reaction.entity';

@Entity({ name: 'comments' })
class CommentEntityTypeOrm {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false })
  title: string;

  @OneToMany(() => ReactionEntity, (reaction) => reaction.comment)
  reactions: ReactionEntity[];
}

export default CommentEntityTypeOrm;
