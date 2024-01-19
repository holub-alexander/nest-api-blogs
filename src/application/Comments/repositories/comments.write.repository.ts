import { Injectable } from '@nestjs/common';
import { UpdateCommentForPostDto } from '../dto/update.dto';
import CommentEntity from '../../../db/entities/comment.entity';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CommentsWriteRepository {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(CommentEntity) private readonly commentRepository: Repository<CommentEntity>,
  ) {}

  public async create() {
    return this.commentRepository.create();
  }

  public async save(createdComment: CommentEntity): Promise<CommentEntity | null> {
    const savedComment = await this.commentRepository.save(createdComment);

    return this.commentRepository.findOne({ where: { id: savedComment.id }, relations: ['user'] });
  }

  public async deleteById(id: number, userId: number): Promise<boolean> {
    const res = await this.commentRepository.delete({ id });

    return !res.affected ? false : res.affected > 0;
  }

  public async updateById(commentId: string, body: UpdateCommentForPostDto): Promise<boolean> {
    if (!commentId || !Number.isInteger(+commentId)) {
      return false;
    }

    const res = await this.commentRepository.update({ id: +commentId }, { content: body.content });

    return !res.affected ? false : res.affected > 0;
  }

  public async deleteMany(): Promise<boolean> {
    const res = await this.commentRepository.delete({});

    return !res.affected ? false : res.affected > 0;
  }
}
