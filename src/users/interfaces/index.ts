import { CreateUserDto } from '@/users/dto/create.dto';

export type UserViewModel = Omit<CreateUserDto, 'password'> & {
  id: string;
  createdAt: string;
};
