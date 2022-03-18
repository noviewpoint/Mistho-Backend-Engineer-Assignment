import { Controller, Get } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  @Get()
  getHello(): Promise<string> {
    return this.scraperService.getHello();
  }

  @MessagePattern({ cmd: 'scrape' })
  async scrape() {
    await this.scraperService.getHello();
  }
}
