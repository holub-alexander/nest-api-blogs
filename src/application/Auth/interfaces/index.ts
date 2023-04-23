export interface LoginInputModel {
  loginOrEmail: string;
  password: string;
}

export interface RegistrationConfirmationCodeModel {
  code: string;
}

export interface RegistrationEmailResending {
  email: string;
}

export interface PasswordRecoveryInputModel {
  email: string;
}

export interface NewPasswordRecoveryInputModel {
  newPassword: string;
  recoveryCode: string;
}

export interface LoginSuccessViewModel {
  accessToken: string;
}

export interface MeViewModel {
  email: string;
  login: string;
  userId: string;
}

export interface UserPayload {
  loginOrEmail: string;
  login: string;
}

export interface UserRefreshTokenPayload {
  login: string;
  deviceId: string;
  iat: number;
  exp: number;
}
