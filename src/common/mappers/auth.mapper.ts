import { UserDocument } from '@/entity/user.entity';
import { MeViewModel } from '@/auth/interfaces';

export class AuthMapper {
  public static mapMeViewModel(data: UserDocument): MeViewModel {
    return {
      email: data.accountData.email,
      login: data.accountData.login,
      userId: data._id.toString(),
    };
  }
}
