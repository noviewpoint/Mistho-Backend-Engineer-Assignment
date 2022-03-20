import { Test, TestingModule } from '@nestjs/testing';
import { GlassdoorController } from './glassdoor.controller';
import { GlassdoorService } from './glassdoor.service';
import { UtilsModule } from '@app/utils';
import { DatabaseClientModule } from '@app/database-client';
import { SharedConfigurationModule } from '@app/shared-configuration';
import { MessageBrokerClientModule } from '@app/message-broker-client';

describe('GlassdoorController', () => {
  let controller: GlassdoorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        UtilsModule,
        DatabaseClientModule,
        SharedConfigurationModule,
        MessageBrokerClientModule,
      ],
      controllers: [GlassdoorController],
      providers: [GlassdoorService],
    }).compile();

    controller = module.get<GlassdoorController>(GlassdoorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
