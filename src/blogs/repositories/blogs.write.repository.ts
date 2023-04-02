import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { Blog, BlogDocument } from '../../schemas/blog.schema';
import { InjectModel } from '@nestjs/mongoose';
import { BlogInputModel } from '../@types';

@Injectable()
export class BlogsWriteRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: Model<BlogDocument>) {}

  public async save(doc: BlogDocument): Promise<boolean> {
    const data = await doc.save();
    return Boolean(data);
  }

  public async deleteOne(blogId: string): Promise<boolean> {
    const isValidId = ObjectId.isValid(blogId);

    if (isValidId) {
      const res = await this.BlogModel.deleteOne({ _id: new ObjectId(blogId) });
      return res.deletedCount > 0;
    }

    return false;
  }

  public async updateOne(blogId: string, data: BlogInputModel): Promise<boolean> {
    const isValidId = ObjectId.isValid(blogId);

    if (isValidId) {
      const res = await this.BlogModel.updateOne({ _id: new ObjectId(blogId) }, { $set: data });
      return res.modifiedCount > 0;
    }

    return false;
  }

  public async deleteMany(): Promise<boolean> {
    const res = await this.BlogModel.deleteMany({});
    return res.deletedCount > 0;
  }
}
