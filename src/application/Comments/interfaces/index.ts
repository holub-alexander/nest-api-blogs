import { LikeStatuses } from '../../../common/interfaces';

export interface LikesInfoViewModel {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatuses;
}

export interface CommentatorInfo {
  userId: string;
  userLogin: string;
}

export interface CommentViewModel {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: string;
  likesInfo: LikesInfoViewModel;
}
