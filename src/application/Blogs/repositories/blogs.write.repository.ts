import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from '../../../entity/blog.entity';
import { UpdateBlogDto } from '../dto/update.dto';

@Injectable()
export class BlogsWriteRepository {
  constructor(@InjectModel(Blog.name) private readonly BlogModel: Model<BlogDocument>) {}

  public async save(doc: BlogDocument): Promise<BlogDocument> {
    return doc.save();
  }

  public async deleteOne(blogId: string): Promise<boolean> {
    const isValidId = ObjectId.isValid(blogId);

    if (isValidId) {
      const res = await this.BlogModel.deleteOne({ _id: new ObjectId(blogId) });
      return res.deletedCount > 0;
    }

    return false;
  }

  public async updateOne(blogId: string, data: UpdateBlogDto): Promise<boolean> {
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
