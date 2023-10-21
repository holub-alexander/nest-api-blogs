import { UserViewModel } from '../interfaces';
import UserEntityTypeOrm from '../../../db/entities/typeorm/user.entity';

export class UsersMapper {
  public static mapUsersViewModel(data: UserEntityTypeOrm[]): UserViewModel[] {
    return data.map((user) => ({
      id: user.id.toString(),
      login: user.login,
      email: user.email,
      createdAt: user.created_at.toISOString(),
    }));
  }

  public static mapCreatedUserViewModel(user: UserEntityTypeOrm): UserViewModel {
    return {
      id: user.id.toString(),
      login: user.login,
      email: user.email,
      createdAt: user.created_at.toISOString(),
    };
  }
}
