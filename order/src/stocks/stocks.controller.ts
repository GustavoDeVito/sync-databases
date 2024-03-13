import { Controller } from '@nestjs/common';
import { StocksService } from './stocks.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { QueueHelper } from 'src/helpers/queue.helper';

@Controller()
export class StocksController {
  constructor(private readonly stocksService: StocksService) {}

  @MessagePattern(QueueHelper.topic)
  getMessage(@Payload() message) {
    return this.stocksService.consumer(message);
  }
}
