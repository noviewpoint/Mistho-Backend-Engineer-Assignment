import { NestFactory } from '@nestjs/core';
import { ScraperModule } from './scraper.module';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    // TODO - logger
    ScraperModule,
    new FastifyAdapter(),
  );
  const configService = app.get(ConfigService);
  const config = new DocumentBuilder()
    .setTitle('Mistho scraper')
    .setDescription('Mistho scraper application')
    .setVersion('0.1')
    .addTag('scraper')
    .addTag('glassdoor')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  // NO MONGO EXCEPTION FILTER FOR SCRAPER

  for (const queue of [configService.get<string>('GLASSDOOR_QUEUE')]) {
    app.connectMicroservice<MicroserviceOptions>(
      {
        transport: Transport.RMQ,
        options: {
          prefetchCount: 1,
          urls: [configService.get<string>('MESSAGE_BROKER_CONNECTION')],
          queue,
          queueOptions: {
            durable: true,
          },
        },
      },
      { inheritAppConfig: true },
    );
  }
  // https://docs.nestjs.com/faq/hybrid-application
  await app.startAllMicroservices();
  await app.listen(configService.get<number>('SCRAPER_HTTP_PORT'));
}

bootstrap();
