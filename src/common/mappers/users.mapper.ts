import { UserViewModel } from '../../users/interfaces';
import { UserDocument } from '../../entity/user.entity';

export class UsersMapper {
  public static mapUsersViewModel(data: UserDocument[]): UserViewModel[] {
    return data.map((user) => ({
      id: user._id.toString(),
      login: user.accountData.login,
      email: user.accountData.email,
      createdAt: user.accountData.createdAt,
    }));
  }

  public static mapCreatedUserViewModel(user: UserDocument): UserViewModel {
    return {
      id: user._id.toString(),
      login: user.accountData.login,
      email: user.accountData.email,
      createdAt: user.accountData.createdAt,
    };
  }
}
