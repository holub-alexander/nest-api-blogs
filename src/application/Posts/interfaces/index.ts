import { LikeStatuses, PhotoSizeViewModel } from '../../../common/interfaces';

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

export interface PostViewModel {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  id: string;
  blogName: string;
  createdAt: string | Date;
  extendedLikesInfo: ExtendedLikesInfoViewModel;
  images: PostImagesViewModel;
}

export interface PostImagesViewModel {
  main: PhotoSizeViewModel[] | [];
}
