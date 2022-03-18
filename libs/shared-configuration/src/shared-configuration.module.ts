import { Module } from '@nestjs/common';
import { SharedConfigurationService } from './shared-configuration.service';
import * as Joi from 'joi';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        DATABASE_CONNECTION: Joi.string().required(),
        CACHE_CONNECTION: Joi.string().required(),
        MESSAGE_BROKER_CONNECTION: Joi.string().required(),
        API_HTTP_PORT: Joi.number().required(),
      }),
      validationOptions: {
        allowUnknown: true, // must be true or NVM internal env variables break code
        abortEarly: false, // set to false to see all missing variables at once
      },
      envFilePath: ['.env'], // https://docs.nestjs.com/techniques/configuration#custom-env-file-path
      isGlobal: true, // https://docs.nestjs.com/techniques/configuration#use-module-globally
      cache: true, // https://docs.nestjs.com/techniques/configuration#cache-environment-variables
    }),
  ],
  providers: [SharedConfigurationService],
  exports: [SharedConfigurationService],
})
export class SharedConfigurationModule {}
