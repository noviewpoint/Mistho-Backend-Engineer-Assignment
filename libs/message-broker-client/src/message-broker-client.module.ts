import { Module } from '@nestjs/common';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { MessageBrokerClientService } from './message-broker-client.service';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [
    MessageBrokerClientService,
    {
      provide: 'MESSAGE_BROKER_CLIENT',
      useFactory: async (configService: ConfigService) => {
        for (const queue of [configService.get<string>('GLASSDOOR_QUEUE')]) {
          return ClientProxyFactory.create({
            transport: Transport.RMQ,
            options: {
              urls: [configService.get<string>('MESSAGE_BROKER_CONNECTION')],
              queue,
              queueOptions: {
                durable: true,
              },
            },
          });
        }
      },
      inject: [ConfigService],
    },
  ],
  exports: [MessageBrokerClientService, 'MESSAGE_BROKER_CLIENT'],
})
export class MessageBrokerClientModule {}
