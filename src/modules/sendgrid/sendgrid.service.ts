import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as SendGrid from '@sendgrid/mail';

@Injectable()
export class SendgridService {
  constructor() {
    SendGrid.setApiKey(process.env.SENDGRID_API_KEY);
  }

  async sendMail(mail: SendGrid.MailDataRequired) {
    try {
      const transport = await SendGrid.send(mail);
      return transport;
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error');
    }
  }
}
