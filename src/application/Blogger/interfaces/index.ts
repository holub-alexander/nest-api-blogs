import { CommentViewModel } from '../../Comments/interfaces';
import { BanUserInfoViewModel } from '../../Users/interfaces';

export interface PostInfo {
  id: string;
  title: string;
  blogId: string;
  blogName: string;
}

export interface CommentBloggerViewModel extends Omit<CommentViewModel, 'likesInfo'> {
  postInfo: PostInfo;
}

export interface UserBloggerViewModel {
  id: string;
  login: string;
  banInfo: BanUserInfoViewModel;
}
