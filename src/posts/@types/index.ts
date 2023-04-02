import { LikeStatuses } from '../../@types';

export type PostInputModel = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
};

export type LikesInfoViewModel = {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatuses;
};

export type NewestLike = {
  addedAt: Date | string;
  userId: string;
  login: string;
};

export type ExtendedLikesInfoViewModel = LikesInfoViewModel & {
  newestLikes: NewestLike[] | [];
};

export type PostViewModel = PostInputModel & {
  id: string;
  blogName: string;
  createdAt: string | Date;
  extendedLikesInfo: ExtendedLikesInfoViewModel;
};
