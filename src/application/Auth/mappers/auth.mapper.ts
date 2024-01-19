import { MeViewModel } from 'src/application/Auth/interfaces';
import UserEntity from '../../../db/entities/user.entity';

export class AuthMapper {
  public static mapMeViewModel(data: UserEntity): MeViewModel {
    return {
      email: data.email,
      login: data.login,
      userId: data.id.toString(),
    };
  }
}
