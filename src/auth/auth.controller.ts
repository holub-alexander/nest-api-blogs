import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Ip,
  NotFoundException,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '@/auth/auth.service';
import { CreateUserDto } from '@/users/dto/create.dto';
import {
  ConfirmRegistrationInputDto,
  LoginInputDto,
  NewPasswordRecoveryInputDto,
  PasswordRecoveryInputDto,
  RegistrationEmailResendingInputDto,
} from '@/auth/dto/create.dto';
import { Response, Request } from 'express';
import config from '@/config/config';
import { JwtTokenGuard } from '@/auth/guards/jwt-token.guard';
import { RefreshTokenGuard } from '@/auth/guards/refresh-token.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  @HttpCode(200)
  public async login(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Ip() ip: string,
    @Body() body: LoginInputDto,
  ) {
    const tokens = await this.authService.login(body, ip, req.headers['user-agent']);

    if (!tokens) {
      throw new UnauthorizedException();
    }

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: config.enableSecureCookie,
      secure: config.enableSecureCookie,
    });

    return { accessToken: tokens.accessToken };
  }

  @Post('/registration')
  @HttpCode(204)
  public async registration(@Body() body: CreateUserDto) {
    return this.authService.register(body);
  }

  @Post('/registration-confirmation')
  @HttpCode(204)
  public async confirmRegistration(@Body() body: ConfirmRegistrationInputDto) {
    const user = await this.authService.confirmRegistration(body);

    if (!user) {
      throw new BadRequestException([
        {
          message: 'Confirmation code is incorrect, expired or already been applied',
          field: 'code',
        },
      ]);
    }
  }

  @Post('/registration-email-resending')
  @HttpCode(204)
  public async registrationEmailResending(@Body() body: RegistrationEmailResendingInputDto) {
    const isResendConfirmationCode = await this.authService.registrationEmailResending(body);

    if (!isResendConfirmationCode) {
      throw new BadRequestException([
        {
          message: 'Email already verified or no email',
          field: 'email',
        },
      ]);
    }
  }

  @UseGuards(JwtTokenGuard)
  @Get('/me')
  public async me(@Req() req: Request) {
    const userMe = await this.authService.me(req.user.loginOrEmail);

    if (!userMe) {
      throw new UnauthorizedException();
    }

    return userMe;
  }

  @UseGuards(RefreshTokenGuard)
  @Post('/refresh-token')
  public async refreshToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    if (!req.cookies.refreshToken) {
      throw new UnauthorizedException();
    }

    const newTokens = await this.authService.updateTokens(req.userRefreshTokenPayload);

    if (!newTokens) {
      throw new UnauthorizedException();
    }

    res.cookie('refreshToken', newTokens.refreshToken, {
      httpOnly: config.enableSecureCookie,
      secure: config.enableSecureCookie,
    });

    return { accessToken: newTokens.accessToken };
  }

  @UseGuards(RefreshTokenGuard)
  @Post('/logout')
  @HttpCode(204)
  public async logout(@Req() req: Request) {
    if (!req.cookies.refreshToken) {
      throw new UnauthorizedException();
    }

    return this.authService.logout(req.userRefreshTokenPayload);
  }

  @Post('/password-recovery')
  @HttpCode(204)
  public async passwordRecovery(@Body() body: PasswordRecoveryInputDto) {
    await this.authService.passwordRecovery(body);
  }

  @Post('/new-password')
  @HttpCode(204)
  public async confirmPasswordRecovery(@Body() body: NewPasswordRecoveryInputDto) {
    const isValidToken = await this.authService.verifyPasswordRecoveryJwtToken(body.recoveryCode);

    if (!isValidToken) {
      throw new BadRequestException([{ field: 'recoveryCode', message: 'recoveryCode is incorrect or expired' }]);
    }

    const isUpdatedPassword = await this.authService.confirmPasswordRecovery(body);

    if (!isUpdatedPassword) {
      throw new NotFoundException();
    }
  }
}
