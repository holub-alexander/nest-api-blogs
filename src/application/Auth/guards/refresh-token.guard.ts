import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRefreshTokenPayload } from '../interfaces';
import { UsersQueryRepository } from '../../Users/repositories/users.query.repository';
import { SecurityDevicesQueryRepository } from '../../Security-Devices/repositories/security-devices.query.repository';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly securityDevicesQueryRepository: SecurityDevicesQueryRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
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

      if (new Date(foundDevice.issued_at).valueOf() !== refreshTokenPayload.iat * 1000) {
        throw new UnauthorizedException();
      }

      request['userRefreshTokenPayload'] = refreshTokenPayload;
    } catch (err) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
