import { Module } from '@nestjs/common';
import { StocksService } from './stocks.service';
import { StocksController } from './stocks.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { QueueHelper } from 'src/helpers/queue.helper';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'MODEL_PRODUCT',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: QueueHelper.clientId,
            brokers: [process.env.BROKER_URL],
          },
          producerOnlyMode: true,
          consumer: {
            allowAutoTopicCreation: true,
            groupId: QueueHelper.groupId,
          },
        },
      },
    ]),
    PrismaModule,
  ],
  controllers: [StocksController],
  providers: [StocksService],
  exports: [StocksService],
})
export class StocksModule {}
