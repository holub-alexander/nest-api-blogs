import { CreateBlogDto } from '../dto/create.dto';

export interface BlogViewModel extends CreateBlogDto {
  id: string;
  createdAt: string | Date;
  isMembership: boolean;
}

export interface BlogViewModelSuperAdmin extends CreateBlogDto {
  id: string;
  createdAt: string | Date;
  isMembership: boolean;
}
