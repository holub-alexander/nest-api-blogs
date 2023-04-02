import { ObjectId } from 'mongodb';
import { getObjectToSort } from '../../utils/get-object-to-sort';
import { Post, PostDocument } from '../../schemas/post.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaginationAndSortQueryParams, Paginator, SortDirections } from '../../@types';
import { Injectable } from '@nestjs/common';
import { PostViewModel } from '../@types';

type PostViewFields = Pick<PostViewModel, 'blogName'>;

const getFieldToSort = (field: string): string => {
  const fields: PostViewFields = {
    blogName: 'blog.name',
  };

  // @ts-ignore
  return fields[field] ? fields[field] : field;
};

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectModel(Post.name) private PostModel: Model<PostDocument>) {}

  public async findAll({
    pageSize = 10,
    pageNumber = 1,
    sortDirection = SortDirections.DESC,
    sortBy = '',
  }): Promise<Paginator<PostDocument[]>> {
    const sorting = getObjectToSort({ sortBy, sortDirection, field: getFieldToSort(sortBy) });
    const pageSizeValue = pageSize < 1 ? 1 : pageSize;

    const totalCount = await this.PostModel.countDocuments({});
    const res = await this.PostModel.find<PostDocument>()
      .skip((+pageNumber - 1) * +pageSizeValue)
      .limit(+pageSizeValue)
      .sort(sorting);

    return {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount,
      items: res,
    };
  }

  public async findAllByBlogId({
    pageSize = 10,
    pageNumber = 1,
    sortDirection = SortDirections.DESC,
    sortBy = '',
    id,
  }: PaginationAndSortQueryParams & { id: ObjectId }): Promise<Paginator<PostDocument[]>> {
    const sorting = getObjectToSort({ sortBy, sortDirection });
    const pageSizeValue = pageSize < 1 ? 1 : pageSize;
    const totalCount = await this.PostModel.find({ 'blog.id': id }).countDocuments({});
    const res = await this.PostModel.find<PostDocument>({ 'blog.id': id })
      .skip((+pageNumber - 1) * +pageSizeValue)
      .limit(+pageSizeValue)
      .sort(sorting);

    return {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount,
      items: res,
    };
  }

  public async findOne(postId: string): Promise<PostDocument | null> {
    const isValidId = ObjectId.isValid(postId);

    if (isValidId) {
      const data = await this.PostModel.findById(new ObjectId(postId));

      if (data) {
        return data;
      }
    }

    return null;
  }
}
