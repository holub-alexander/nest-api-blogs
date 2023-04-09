import { LikeStatuses } from '@/common/interfaces';
import { CreatePostDto } from '@/posts/dto/create.dto';

export interface LikesInfoViewModel {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatuses;
}

export interface NewestLike {
  addedAt: Date | string;
  userId: string;
  login: string;
}

export type ExtendedLikesInfoViewModel = LikesInfoViewModel & {
  newestLikes: NewestLike[] | [];
};

export interface PostViewModel extends CreatePostDto {
  id: string;
  blogName: string;
  createdAt: string | Date;
  extendedLikesInfo: ExtendedLikesInfoViewModel;
}
