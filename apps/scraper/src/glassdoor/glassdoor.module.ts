import { Module } from '@nestjs/common';
import { GlassdoorService } from './glassdoor.service';
import { GlassdoorController } from './glassdoor.controller';

@Module({
  providers: [GlassdoorService],
  controllers: [GlassdoorController],
})
export class GlassdoorModule {}
