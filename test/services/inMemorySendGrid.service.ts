import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class InMemorySendgridService {
  async sendMail() {
    try {
      return { message: 'Email sent' };
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error');
    }
  }
}
