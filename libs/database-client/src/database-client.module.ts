import { Module } from '@nestjs/common';
import { Db, MongoClient } from 'mongodb';
import { ConfigService } from '@nestjs/config';
import { UtilsModule } from '@app/utils';
import { UtilsService } from '@app/utils/utils.service';
import { DatabaseClientService } from './database-client.service';

@Module({
  imports: [UtilsModule],
  providers: [
    DatabaseClientService,
    {
      provide: 'DATABASE_CLIENT',
      useFactory: async (configService: ConfigService): Promise<Db> => {
        const client = await MongoClient.connect(
          configService.get<string>('DATABASE_CONNECTION'),
        );
        // Nest waits for db connection to be resolved before starting the application
        return client.db();
      },
      inject: [ConfigService, UtilsService],
    },
  ],
  exports: [DatabaseClientService, 'DATABASE_CLIENT'],
})
export class DatabaseClientModule {}
