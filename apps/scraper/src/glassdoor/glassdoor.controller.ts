import { Controller } from '@nestjs/common';
import { GlassdoorService } from './glassdoor.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller('glassdoor')
export class GlassdoorController {
  constructor(private readonly glassdoorService: GlassdoorService) {}

  @MessagePattern({ cmd: 'scrape' })
  async scrape() {
    // await this.glassdoorService.work();
  }
}
