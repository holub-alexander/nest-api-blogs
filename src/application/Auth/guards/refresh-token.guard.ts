import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRefreshTokenPayload } from '../interfaces';
import { UsersTypeOrmQueryRepository } from '../../Users/repositories/typeorm/users.query.repository';
import { SecurityDevicesTypeOrmQueryRepository } from '../../Security-Devices/repositories/typeorm/security-devices.query.repository';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly securityDevicesQueryRepository: SecurityDevicesTypeOrmQueryRepository,
    private readonly usersQueryRepository: UsersTypeOrmQueryRepository,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean | never> {
    const request = context.switchToHttp().getRequest();
    const tokenFromCookie = request.cookies.refreshToken;

    if (!tokenFromCookie) {
      throw new UnauthorizedException();
    }

    try {
      const refreshTokenPayload: UserRefreshTokenPayload = await this.jwtService.verifyAsync(tokenFromCookie, {
        secret: process.env.REFRESH_TOKEN_PRIVATE_KEY as string,
      });
      const foundDevice = await this.securityDevicesQueryRepository.findDeviceById(refreshTokenPayload.deviceId);

      if (!foundDevice) {
        throw new UnauthorizedException();
      }

      const foundUser = await this.usersQueryRepository.findUserById(foundDevice.user_id.toString());

      // const checkIssuedAt = findUser.refreshTokensMeta.findIndex(
      //   // @ts-ignore
      //   (device) => new Date(device.issuedAt).valueOf() === refreshTokenPayload.iat * 1000,
      // );

      // if (checkIssuedAt === -1) {
      //   throw new UnauthorizedException();
      // }

      request['userRefreshTokenPayload'] = refreshTokenPayload;
    } catch (err) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
