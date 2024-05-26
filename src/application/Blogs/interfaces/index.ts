import { CreateBlogDto } from '../dto/create.dto';
import { PhotoSizeViewModel } from '../../../common/interfaces';

export interface BlogViewModel extends CreateBlogDto {
  id: string;
  createdAt: string | Date;
  isMembership: boolean;
  images: BlogImagesViewModel;
}

export interface BlogImagesViewModel {
  wallpaper: PhotoSizeViewModel | null;
  main: PhotoSizeViewModel[] | [];
}

export interface BlogViewModelSuperAdmin extends CreateBlogDto {
  id: string;
  createdAt: string | Date;
  isMembership: boolean;
  blogOwnerInfo: {
    userId: string | null;
    userLogin: string | null;
  };
  banInfo: {
    isBanned: boolean;
    banDate: string | null;
  };
}
