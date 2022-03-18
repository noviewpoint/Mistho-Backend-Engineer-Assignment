import { Test, TestingModule } from '@nestjs/testing';
import { SharedConfigurationService } from './shared-configuration.service';

describe('SharedConfigurationService', () => {
  let service: SharedConfigurationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SharedConfigurationService],
    }).compile();

    service = module.get<SharedConfigurationService>(
      SharedConfigurationService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
