import { Controller } from '@nestjs/common';
import { GlassdoorService } from './glassdoor.service';
import { MessagePattern } from '@nestjs/microservices';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('glassdoor')
@Controller('glassdoor')
export class GlassdoorController {
  constructor(private readonly glassdoorService: GlassdoorService) {}

  @MessagePattern({ cmd: 'scrape' })
  async scrape() {
    await this.glassdoorService.work();
  }
}
