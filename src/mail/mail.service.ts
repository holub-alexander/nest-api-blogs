import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  private async sendMail(email: string, subject: string, message: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject,
        html: message,
        template: '/email',
        context: {
          message,
        },
      });

      console.log('Email sent successfully');
    } catch (err) {
      console.log('Email not sent');
      console.log(err);
    }
  }

  public async sendConfirmationCodeEmail(email: string, confirmationCode: string) {
    return this.sendMail(
      email,
      'Registration in the system',
      `<h1>Thank for your registration</h1>
       <p>To finish registration please follow the link below:
          <a href=https://somesite.com/confirm-email?code=${confirmationCode}>complete registration</a>
      </p>`,
    );
  }

  public async sendPasswordRecoveryEmail(email: string, recoveryCode: string) {
    return this.sendMail(
      email,
      'Password recovery',
      `
       <h1>Password recovery</h1>
       <p>To finish password recovery please follow the link below:
          <a href='https://somesite.com/password-recovery?recoveryCode=${recoveryCode}'>recovery password</a>
       </p>
    `,
    );
  }
}
