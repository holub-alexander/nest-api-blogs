import { MeViewModel } from 'src/application/Auth/interfaces';
import { UserDocument } from '../../db/entities/mongoose/user.entity';

export class AuthMapper {
  public static mapMeViewModel(data: UserDocument): MeViewModel {
    return {
      email: data.accountData.email,
      login: data.accountData.login,
      userId: data._id.toString(),
    };
  }
}
