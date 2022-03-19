import { Module } from '@nestjs/common';
import { ScraperController } from './scraper.controller';
import { ScraperService } from './scraper.service';
import { UtilsModule } from '@app/utils';
import { DatabaseClientModule } from '@app/database-client';
import { SharedConfigurationModule } from '@app/shared-configuration';
import { MessageBrokerClientModule } from '@app/message-broker-client';
import { GlassdoorModule } from './glassdoor/glassdoor.module';

@Module({
  imports: [
    UtilsModule,
    DatabaseClientModule,
    SharedConfigurationModule,
    MessageBrokerClientModule,
    GlassdoorModule,
  ],
  controllers: [ScraperController],
  providers: [ScraperService],
})
export class ScraperModule {}
