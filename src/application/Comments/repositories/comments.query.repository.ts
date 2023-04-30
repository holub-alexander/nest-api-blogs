import { ObjectId } from 'mongodb';
import mongoose, { Model } from 'mongoose';
import { PaginationOptionsDto } from '../../../common/dto/pagination-options.dto';
import { SortDirections } from '../../../common/interfaces';
import { InjectModel } from '@nestjs/mongoose';
import { CommentDocument, Comment } from '../../../entity/comment.entity';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { PaginationMetaDto } from '../../../common/dto/pagination-meta.dto';
import { getObjectToSort } from '../../../common/utils/get-object-to-sort';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CommentsQueryRepository {
  constructor(@InjectModel(Comment.name) private readonly CommentModel: Model<CommentDocument>) {}

  public async find(commentId: string): Promise<CommentDocument | null> {
    const isValidId = ObjectId.isValid(commentId);

    if (isValidId) {
      return this.CommentModel.findOne<CommentDocument>({
        _id: new ObjectId(commentId),
        'commentatorInfo.isBanned': false,
      });
    }

    return null;
  }

  public async findAllWithPagination(
    { pageSize = 10, pageNumber = 1, sortDirection = SortDirections.DESC, sortBy = '' }: PaginationOptionsDto,
    postId: string,
  ): Promise<PaginationDto<CommentDocument>> {
    const sorting = getObjectToSort({ sortBy, sortDirection });
    const pageSizeValue = pageSize < 1 ? 1 : pageSize;
    const filter = { postId: new mongoose.Types.ObjectId(postId), 'commentatorInfo.isBanned': false };

    const totalCount = await this.CommentModel.countDocuments(filter);
    const items = await this.CommentModel.find<CommentDocument>(filter)
      .skip((+pageNumber - 1) * +pageSizeValue)
      .limit(+pageSizeValue)
      .sort(sorting);

    const paginationMetaDto = new PaginationMetaDto({
      paginationOptionsDto: { pageSize, pageNumber, sortBy, sortDirection },
      totalCount,
    });

    return new PaginationDto(items, paginationMetaDto);
  }

  public async findAllByPostsIds(
    { pageSize = 10, pageNumber = 1, sortDirection = SortDirections.DESC, sortBy = '' }: PaginationOptionsDto,
    postsIds: ObjectId[],
    userId: ObjectId,
  ) {
    const sorting = getObjectToSort({ sortBy, sortDirection });
    const pageSizeValue = pageSize < 1 ? 1 : pageSize;
    const filter = {
      postId: { $in: postsIds },
      'commentatorInfo.id': { $ne: userId },
      'commentatorInfo.isBanned': false,
    };

    const totalCount = await this.CommentModel.countDocuments(filter);
    const items = await this.CommentModel.find<CommentDocument>(filter)
      .skip((+pageNumber - 1) * +pageSizeValue)
      .limit(+pageSizeValue)
      .sort(sorting);

    const paginationMetaDto = new PaginationMetaDto({
      paginationOptionsDto: { pageSize, pageNumber, sortBy, sortDirection },
      totalCount,
    });

    return new PaginationDto(items, paginationMetaDto);
  }
}
