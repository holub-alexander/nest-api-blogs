import { CreateUserDto } from '../dto/create.dto';

export type UserViewModel = Omit<CreateUserDto, 'password'> & {
  id: string;
  createdAt: string;
};
