import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UsersQueryRepository } from '../../Users/repositories/users.query.repository';

@Injectable()
export class JwtTokenGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService, private readonly usersQueryRepository: UsersQueryRepository) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.ACCESS_TOKEN_PRIVATE_KEY,
      });

      const user = await this.usersQueryRepository.findByLogin(payload.login);

      if (!user || user.accountData.isBanned) {
        throw new UnauthorizedException();
      }

      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
