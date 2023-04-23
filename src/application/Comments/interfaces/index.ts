import { LikeStatuses } from '../../../common/interfaces';

export type LikesInfoViewModel = {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatuses;
};

export type CommentatorInfo = {
  userId: string;
  userLogin: string;
};

export type CommentViewModel = {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: string;
  likesInfo: LikesInfoViewModel;
};
