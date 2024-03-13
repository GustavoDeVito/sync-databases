import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
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
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
