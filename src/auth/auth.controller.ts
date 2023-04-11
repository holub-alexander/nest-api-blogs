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
import { AuthGuard } from '@/auth/guards/auth.guard';

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

  @UseGuards(AuthGuard)
  @Get('/me')
  public async me(@Req() req: Request) {
    const userMe = await this.authService.me(req.user.loginOrEmail);

    if (!userMe) {
      throw new UnauthorizedException();
    }

    return userMe;
  }
  //
  // async refreshToken(req: Request, res: Response) {
  //   if (!req.cookies.refreshToken) {
  //     return res.sendStatus(401);
  //   }
  //
  //   const newTokens = await this.authService.updateTokens(req.userRefreshTokenPayload);
  //
  //   if (!newTokens) {
  //     return res.sendStatus(401);
  //   }
  //
  //   /* TODO: test */
  //   res.cookie('refreshToken', newTokens.refreshToken, {
  //     httpOnly: config.enableSecureCookie,
  //     secure: config.enableSecureCookie,
  //   });
  //
  //   return res.status(constants.HTTP_STATUS_OK).send({ accessToken: newTokens.accessToken });
  // }
  //
  // async logout(req: Request, res: Response) {
  //   if (!req.cookies.refreshToken) {
  //     return res.sendStatus(401);
  //   }
  //
  //   const response = await this.authService.logout(req.userRefreshTokenPayload);
  //
  //   return res.sendStatus(response ? constants.HTTP_STATUS_NO_CONTENT : 401);
  // }

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
