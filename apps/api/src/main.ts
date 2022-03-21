import { NestFactory } from '@nestjs/core';
import { ApiModule } from './api.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MongoExceptionFilter } from './mongo-exception.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    // TODO - logger
    ApiModule,
    new FastifyAdapter(),
  );
  const configService = app.get(ConfigService);
  const config = new DocumentBuilder()
    .setTitle('Mistho API')
    .setDescription('Mistho API application')
    .setVersion('0.1')
    .addTag('api')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalFilters(new MongoExceptionFilter());
  await app.listen(configService.get<number>('API_HTTP_PORT'));
}

bootstrap();
