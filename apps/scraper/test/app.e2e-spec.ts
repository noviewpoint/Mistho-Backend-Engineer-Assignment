import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ScraperModule } from '../src/scraper.module';

describe('ScraperController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ScraperModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/scraper (GET)', () => {
    return request(app.getHttpServer())
      .get('/scraper')
      .expect(200)
      .expect('Hello World!');
  });

  // TODO - close opened connections
});
