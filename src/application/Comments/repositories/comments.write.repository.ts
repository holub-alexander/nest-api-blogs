import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from '../../../entity/comment.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { UpdateCommentForPostDto } from '../dto/update.dto';

@Injectable()
export class CommentsWriteRepository {
  constructor(@InjectModel(Comment.name) private readonly CommentModel: Model<CommentDocument>) {}

  public async save(comment: CommentDocument): Promise<CommentDocument> {
    return comment.save();
  }

  public async deleteById(id: string): Promise<boolean> {
    const isValidId = ObjectId.isValid(id);

    if (!isValidId) {
      return false;
    }

    const res = await this.CommentModel.deleteOne({ _id: new ObjectId(id) });
    return res.deletedCount > 0;
  }

  public async updateById(id: string, body: UpdateCommentForPostDto): Promise<boolean> {
    const isValidId = ObjectId.isValid(id);

    if (!isValidId) {
      return false;
    }

    const res = await this.CommentModel.updateOne({ _id: new ObjectId(id) }, { $set: body });
    return res.modifiedCount > 0;
  }

  public async updateLikesCount(id: ObjectId, count: number) {
    return this.CommentModel.updateOne({ _id: id }, { 'likesInfo.likesCount': count });
  }

  public async updateDislikesCount(id: ObjectId, count: number) {
    return this.CommentModel.updateOne({ _id: id }, { 'likesInfo.dislikesCount': count });
  }

  public async deleteMany(): Promise<boolean> {
    const res = await this.CommentModel.deleteMany({});
    return res.deletedCount > 0;
  }

  public async updateUserBanStatus(userId: ObjectId, isBanned: boolean) {
    await this.CommentModel.updateMany({ 'commentatorInfo.id': userId }, { 'commentatorInfo.isBanned': isBanned });
  }
}
