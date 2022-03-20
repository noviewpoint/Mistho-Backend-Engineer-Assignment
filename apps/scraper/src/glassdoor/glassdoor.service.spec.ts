import { Test, TestingModule } from '@nestjs/testing';
import { GlassdoorService } from './glassdoor.service';
import { UtilsModule } from '@app/utils';
import { DatabaseClientModule } from '@app/database-client';
import { SharedConfigurationModule } from '@app/shared-configuration';
import { MessageBrokerClientModule } from '@app/message-broker-client';

describe('GlassdoorService', () => {
  let service: GlassdoorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        UtilsModule,
        DatabaseClientModule,
        SharedConfigurationModule,
        MessageBrokerClientModule,
      ],
      providers: [GlassdoorService],
    }).compile();

    service = module.get<GlassdoorService>(GlassdoorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
