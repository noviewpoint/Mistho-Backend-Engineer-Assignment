import { Test, TestingModule } from '@nestjs/testing';
import { GlassdoorController } from './glassdoor.controller';

describe('GlassdoorController', () => {
  let controller: GlassdoorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GlassdoorController],
    }).compile();

    controller = module.get<GlassdoorController>(GlassdoorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
