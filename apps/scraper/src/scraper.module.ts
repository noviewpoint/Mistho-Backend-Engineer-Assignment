import { Module } from '@nestjs/common';
import { ScraperController } from './scraper.controller';
import { ScraperService } from './scraper.service';
import { UtilsModule } from '@app/utils';
import { DatabaseClientModule } from '@app/database-client';
import { SharedConfigurationModule } from '@app/shared-configuration';
import { MessageBrokerClientModule } from '@app/message-broker-client';

@Module({
  imports: [
    UtilsModule,
    DatabaseClientModule,
    SharedConfigurationModule,
    DatabaseClientModule,
    MessageBrokerClientModule,
  ],
  controllers: [ScraperController],
  providers: [ScraperService],
})
export class ScraperModule {}
