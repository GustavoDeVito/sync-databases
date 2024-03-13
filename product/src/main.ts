import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { QueueHelper } from './helpers/queue.helper';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: [process.env.BROKER_URL],
      },
      subscribe: {
        fromBeginning: true,
      },
      consumer: {
        allowAutoTopicCreation: true,
        groupId: QueueHelper.groupId,
      },
    },
  });

  app.enableCors();
  app.use(helmet());

  app.useGlobalPipes(
    new ValidationPipe({
      errorHttpStatusCode: 422,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.startAllMicroservices();
  await app.listen(3000);
}
bootstrap();
