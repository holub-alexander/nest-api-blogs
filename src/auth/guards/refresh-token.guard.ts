import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SecurityDevicesQueryRepository } from '../../security-devices/repositories/security-devices.query.repository';
import { UserRefreshTokenPayload } from '../interfaces';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly securityDevicesQueryRepository: SecurityDevicesQueryRepository,
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
      const findUser = await this.securityDevicesQueryRepository.findUserByDeviceId(refreshTokenPayload.deviceId);

      if (!findUser) {
        throw new UnauthorizedException();
      }

      const checkIssuedAt = findUser.refreshTokensMeta.findIndex(
        (device) => new Date(device.issuedAt).valueOf() === refreshTokenPayload.iat * 1000,
      );

      if (checkIssuedAt === -1) {
        throw new UnauthorizedException();
      }

      request['userRefreshTokenPayload'] = refreshTokenPayload;
    } catch (err) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
