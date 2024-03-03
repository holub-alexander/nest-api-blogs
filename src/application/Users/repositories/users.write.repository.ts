import { Injectable } from '@nestjs/common';
import UserEntity from '../../../db/entities/user.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository, UpdateResult } from 'typeorm';

@Injectable()
export class UsersWriteRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(UserEntity) private readonly usersRepository: Repository<UserEntity>,
  ) {}

  public create() {
    return this.usersRepository.create();
  }

  public async save(createUserDto: UserEntity): Promise<UserEntity | null> {
    return this.usersRepository.save(createUserDto);
  }

  public async deleteOne(userId: string): Promise<boolean> {
    if (!userId || !Number.isInteger(+userId)) {
      return false;
    }

    const res = await this.usersRepository.delete(+userId);

    return !res.affected ? false : res.affected > 0;
  }

  public async deleteMany(): Promise<boolean> {
    const res = await this.usersRepository.delete({});

    return !res.affected ? false : res.affected > 0;
  }

  public async confirmRegistration(id: number): Promise<boolean> {
    const res = await this.usersRepository.update(+id, { confirmation_code: null, is_confirmed: true });

    return !res.affected ? false : res.affected > 0;
  }

  public async updateConfirmationCode(
    id: number,
    { confirmationCode, expirationDate }: { confirmationCode: string; expirationDate: Date },
  ): Promise<boolean> {
    if (!id || !Number.isInteger(+id)) {
      return false;
    }

    const res = await this.usersRepository.update(+id, {
      confirmation_code: confirmationCode,
      expiration_date: expirationDate,
    });

    return !res.affected ? false : res.affected > 0;
  }

  async passwordRecovery(userId: number, recoveryCode: string): Promise<boolean> {
    if (!userId || !Number.isInteger(+userId)) {
      return false;
    }

    const res = await this.usersRepository.update({ id: +userId }, { recovery_code: recoveryCode });

    return !res.affected ? false : res.affected > 0;
  }

  public async confirmPasswordRecovery({
    recoveryCode,
    passwordHash,
  }: {
    passwordHash: string;
    recoveryCode: string;
  }): Promise<boolean> {
    const res = await this.usersRepository.update(
      { recovery_code: recoveryCode },
      { recovery_code: null, password: passwordHash },
    );

    return !res.affected ? false : res.affected > 0;
  }

  public async banUnban({
    data,
    transactionManager,
  }: {
    data: { userId: number; isBanned: boolean; banReason: string | null; banDate: Date | null };
    transactionManager?: EntityManager;
  }): Promise<boolean> {
    const partialEntity = {
      is_banned: data.isBanned,
      ban_reason: data.banReason,
      ban_date: data.banDate,
    };
    let res: UpdateResult;

    if (transactionManager) {
      res = await transactionManager.update(UserEntity, { id: data.userId }, partialEntity);
    } else {
      res = await this.usersRepository.update({ id: data.userId }, partialEntity);
    }

    return !res.affected ? false : res.affected > 0;
  }
}
