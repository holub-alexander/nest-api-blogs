import { Column, DeepPartial, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'quiz_questions' })
class QuizQuestionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 300,
    default: null,
  })
  body: string | null;

  @Column({
    type: 'jsonb',
    default: null,
  })
  correct_answers: (string | number)[];

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
  })
  published: boolean;

  @Column({
    type: 'timestamptz',
    nullable: false,
    default: new Date(),
  })
  created_at: Date;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  updated_at: Date | null;

  static fromPartial(data: DeepPartial<QuizQuestionEntity>): QuizQuestionEntity {
    return Object.assign(new QuizQuestionEntity(), data);
  }
}

export default QuizQuestionEntity;
