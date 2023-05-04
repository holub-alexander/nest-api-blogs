import { CreateBlogDto } from '../dto/create.dto';

export interface BlogViewModel extends CreateBlogDto {
  id: string;
  createdAt: string | Date;
  isMembership: boolean;
}

export interface BanBlogInfoViewModel {
  isBanned: boolean;
  banDate: string | null;
}

export interface BlogViewModelSuperAdmin extends CreateBlogDto {
  id: string;
  createdAt: string | Date;
  isMembership: boolean;
  blogOwnerInfo: {
    userId: string;
    userLogin: string;
  };
  banInfo: BanBlogInfoViewModel;
}
