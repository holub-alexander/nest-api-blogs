import { UserViewModel } from '../interfaces';
import UserEntity from '../../../db/entities/user.entity';

export class UsersMapper {
  public static mapUsersViewModel(data: UserEntity[]): UserViewModel[] {
    return data.map((user) => ({
      id: user.id.toString(),
      login: user.login,
      email: user.email,
      createdAt: user.created_at.toISOString(),
    }));
  }

  public static mapCreatedUserViewModel(user: UserEntity): UserViewModel {
    return {
      id: user.id.toString(),
      login: user.login,
      email: user.email,
      createdAt: user.created_at.toISOString(),
    };
  }
}
