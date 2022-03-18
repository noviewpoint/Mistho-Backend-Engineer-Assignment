import { Test, TestingModule } from '@nestjs/testing';
import { MessageBrokerClientService } from './message-broker-client.service';

describe('MessageBrokerClientService', () => {
  let service: MessageBrokerClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MessageBrokerClientService],
    }).compile();

    service = module.get<MessageBrokerClientService>(
      MessageBrokerClientService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
