import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { resolve } from 'path';
import { User } from 'src/user/user.entity';
import { MailProducer } from './mail.producer';
@Injectable()
export class MailService {
  constructor(
    private readonly mailProducer: MailProducer,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
  ) {}

  async sendForgotPasswordToken(user: User, url: string) {
    const context = `${MailService.name}.${this.sendForgotPasswordToken.name}`;
    await this.mailProducer.sendMail({
      to: user.email, // list of receivers
      subject: '[Trend Coffee] Reset Password', // Subject line
      template: resolve('public/templates/mail/forgot-password'), // `.ejs` extension is appended automatically
      context: {
        name: `${user.firstName} ${user.lastName}`,
        url,
      },
    });
    this.logger.log(`Email is sending to ${user.email}`, context);
  }

  async sendNewPassword(user: User, newPassword: string) {
    const context = `${MailService.name}.${this.sendNewPassword.name}`;
    try {
      await this.mailProducer.sendMail({
        to: user.email, // list of receivers
        // from: '"Support Team" <support@example.com>', // override default from
        subject: '[Trend Coffee] Reset Password', // Subject line
        template: resolve('public/templates/mail/reset-password'), // `.ejs` extension is appended automatically
        context: {
          name: `${user.firstName} ${user.lastName}`,
          newPassword,
        },
      });
    } catch (error) {
      this.logger.error(
        `Error sending email to ${JSON.stringify(error)}`,
        error.stack,
        context,
      );
      throw new BadRequestException(`Error sending email to ${user.email}`);
    }
    this.logger.log(`Email sent to ${user.email}`, context);
  }

  async sendVerifyEmail(
    user: User,
    code: string,
    email: string,
    expiresAt: string,
  ) {
    const context = `${MailService.name}.${this.sendVerifyEmail.name}`;
    await this.mailProducer.sendMail({
      to: email,
      subject: '[Trend Coffee] Verify Email',
      template: resolve('public/templates/mail/verify-email'),
      context: {
        name: `${user.firstName} ${user.lastName}`,
        code,
        expiresAt,
      },
    });
    this.logger.log(`Email is sending to ${email}`, context);
  }

  async sendInvoiceWhenOrderPaid(user: User, invoice: Buffer) {
    const context = `${MailService.name}.${this.sendInvoiceWhenOrderPaid.name}`;

    if (user.email && user.isVerifiedEmail) {
      await this.mailProducer.sendMail({
        to: user.email,
        subject: '[Trend Coffee] Invoice',
        template: resolve('public/templates/mail/send-invoice'),
        context: {
          name: `${user.firstName} ${user.lastName}`,
        },
        attachments: [
          {
            filename: 'invoice.pdf',
            content: invoice.toString('base64'),
            encoding: 'base64',
            contentType: 'application/pdf',
          },
        ],
      });
      this.logger.log(`Invoice is sending to ${user.email}`, context);
    }
  }
}
