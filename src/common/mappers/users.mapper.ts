import { UserDocument } from '../../entity/user.entity';
import { UserViewModel } from '../../application/Users/interfaces';

export class UsersMapper {
  public static mapUsersViewModel(data: UserDocument[]): UserViewModel[] {
    return data.map((user) => ({
      id: user._id.toString(),
      login: user.accountData.login,
      email: user.accountData.email,
      createdAt: user.accountData.createdAt,
      banInfo: {
        banDate: user.accountData.banDate,
        banReason: user.accountData.banReason,
        isBanned: user.accountData.isBanned,
      },
    }));
  }

  public static mapCreatedUserViewModel(user: UserDocument): UserViewModel {
    return {
      id: user._id.toString(),
      login: user.accountData.login,
      email: user.accountData.email,
      createdAt: user.accountData.createdAt,
      banInfo: {
        banDate: user.accountData.banDate,
        banReason: user.accountData.banReason,
        isBanned: user.accountData.isBanned,
      },
    };
  }
}
