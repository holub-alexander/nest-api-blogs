import { MeViewModel } from 'src/auth/interfaces';
import { UserDocument } from '../../entity/user.entity';

export class AuthMapper {
  public static mapMeViewModel(data: UserDocument): MeViewModel {
    return {
      email: data.accountData.email,
      login: data.accountData.login,
      userId: data._id.toString(),
    };
  }
}
