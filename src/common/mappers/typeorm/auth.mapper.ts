import { MeViewModel } from 'src/application/Auth/interfaces';
import UserEntityTypeOrm from '../../../db/entities/typeorm/user.entity';

export class AuthMapper {
  public static mapMeViewModel(data: UserEntityTypeOrm): MeViewModel {
    return {
      email: data.email,
      login: data.login,
      userId: data.id.toString(),
    };
  }
}
