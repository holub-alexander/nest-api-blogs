import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import config from '../../../config/config';

@Injectable()
export class BasicAuthGuard implements CanActivate {
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorizationHeader = request.headers.authorization;

    if (authorizationHeader) {
      const authorizationHeaderValue = authorizationHeader.replace('Basic ', '');
      const decodeValue = Buffer.from(authorizationHeaderValue, 'base64').toString('ascii');

      if (decodeValue === `${config.login}:${config.password}`) {
        return true;
      }
    }

    throw new UnauthorizedException();
  }
}
