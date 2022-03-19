import { Module } from '@nestjs/common';
import { GlassdoorService } from './glassdoor.service';
import { GlassdoorController } from './glassdoor.controller';
import { UtilsModule } from '@app/utils';
import { DatabaseClientModule } from '@app/database-client';
import { SharedConfigurationModule } from '@app/shared-configuration';
import { MessageBrokerClientModule } from '@app/message-broker-client';

@Module({
  imports: [
    UtilsModule,
    DatabaseClientModule,
    SharedConfigurationModule,
    MessageBrokerClientModule,
  ],
  providers: [GlassdoorService],
  controllers: [GlassdoorController],
})
export class GlassdoorModule {}
