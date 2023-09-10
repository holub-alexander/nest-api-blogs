import { CreateUserDto } from '../dto/create.dto';

export interface BanUserInfoViewModel {
  isBanned: boolean;
  banDate: string | null;
  banReason: string | null;
}

export type UserViewModel = Omit<CreateUserDto, 'password'> & {
  id: string;
  createdAt: string;
  // banInfo: BanUserInfoViewModel;
};
