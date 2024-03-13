import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { OrdersModule } from './orders/orders.module';
import { StocksModule } from './stocks/stocks.module';

@Module({
  imports: [PrismaModule, OrdersModule, StocksModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
