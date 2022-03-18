import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { UtilsModule } from '../../../libs/utils/src';
import { DatabaseClientModule } from '../../../libs/database-client/src';
import { SharedConfigurationModule } from '../../../libs/shared-configuration/src';

@Module({
  imports: [UtilsModule, DatabaseClientModule, SharedConfigurationModule],
  controllers: [ApiController],
  providers: [ApiService],
})
export class ApiModule {}
