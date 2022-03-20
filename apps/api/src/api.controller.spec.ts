import { Test, TestingModule } from '@nestjs/testing';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { DatabaseClientModule } from '@app/database-client';
import { UtilsModule } from '@app/utils';
import { SharedConfigurationModule } from '@app/shared-configuration';
import { MessageBrokerClientModule } from '@app/message-broker-client';

describe('AppController', () => {
  let appController: ApiController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        UtilsModule,
        DatabaseClientModule,
        SharedConfigurationModule,
        MessageBrokerClientModule,
      ],
      controllers: [ApiController],
      providers: [ApiService],
    }).compile();

    appController = app.get<ApiController>(ApiController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
