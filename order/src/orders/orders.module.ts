import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { StocksModule } from 'src/stocks/stocks.module';

@Module({
  imports: [PrismaModule, StocksModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
