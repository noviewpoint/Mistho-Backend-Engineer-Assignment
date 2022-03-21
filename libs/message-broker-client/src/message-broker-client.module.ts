import { Module } from '@nestjs/common';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { MessageBrokerClientService } from './message-broker-client.service';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [
    MessageBrokerClientService,
    {
      provide: 'MESSAGE_BROKER_CLIENT',
      useFactory: async (
        configService: ConfigService,
      ): Promise<ClientProxyFactory> => {
        // TODO - CHANGE THIS TO SUPPORT MULTIPLE QUEUES PER CLIENT
        // Nest waits for rmq connection to be resolved before starting the application
        return ClientProxyFactory.create({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('MESSAGE_BROKER_CONNECTION')],
            queue: configService.get<string>('GLASSDOOR_QUEUE'),
            queueOptions: {
              durable: true,
            },
          },
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [MessageBrokerClientService, 'MESSAGE_BROKER_CLIENT'],
})
export class MessageBrokerClientModule {}
