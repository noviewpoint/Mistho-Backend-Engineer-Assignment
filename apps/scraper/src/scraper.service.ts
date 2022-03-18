import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class ScraperService {
  constructor(@Inject('MESSAGE_BROKER_CLIENT') private client: ClientProxy) {
    this.getHello();
  }

  async getHello(): Promise<string> {
    await this.client.emit(
      { cmd: 'scrape' },
      'Progressive Coder' + Math.random(),
    );
    return 'Hello World!';
  }
}
