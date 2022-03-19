import { Test, TestingModule } from '@nestjs/testing';
import { GlassdoorService } from './glassdoor.service';

describe('GlassdoorService', () => {
  let service: GlassdoorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GlassdoorService],
    }).compile();

    service = module.get<GlassdoorService>(GlassdoorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
