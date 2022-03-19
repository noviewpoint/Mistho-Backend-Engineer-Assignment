import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { GlassdoorService } from './glassdoor.service';

@Controller('glassdoor')
export class GlassdoorController {
  constructor(private readonly glassdoorService: GlassdoorService) {}

  @MessagePattern({ cmd: 'scrape' })
  async scrape() {
    await this.glassdoorService.work();
  }
}
