import { ObjectId } from 'mongodb';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { UpdatePostDto } from '../dto/update.dto';
import { Post, PostDocument } from '../../../entity/post.entity';

@Injectable()
export class PostsWriteRepository {
  constructor(@InjectModel(Post.name) private readonly PostModel: Model<PostDocument>) {}

  public async save(doc: PostDocument): Promise<PostDocument> {
    return doc.save();
  }

  public async create(doc: PostDocument) {
    return this.PostModel.insertMany(doc);
  }

  public async deleteOne(postId: string): Promise<boolean> {
    const isValidId = ObjectId.isValid(postId);

    if (isValidId) {
      const res = await this.PostModel.deleteOne({ _id: new ObjectId(postId) });
      return res.deletedCount > 0;
    }

    return false;
  }

  public async updateOne(postId: string, data: UpdatePostDto): Promise<boolean> {
    const isValidId = ObjectId.isValid(postId);

    if (isValidId) {
      const res = await this.PostModel.updateOne({ _id: postId }, { $set: data });
      return res.modifiedCount > 0;
    }

    return false;
  }

  public async deleteMany(): Promise<boolean> {
    const res = await this.PostModel.deleteMany({});
    return res.deletedCount > 0;
  }

  public async updateUserBanStatus(userId: ObjectId, isBanned: boolean) {
    await this.PostModel.updateMany({ 'userInfo.id': userId }, { 'userInfo.isBanned': isBanned });
  }

  public async updateBanStatusByBlogId(blogId: ObjectId, isBanned: boolean) {
    await this.PostModel.updateOne({ 'blog.id': blogId }, { isBanned });
  }
}
