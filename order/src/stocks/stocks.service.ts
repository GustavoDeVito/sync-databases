import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { PrismaService } from 'src/prisma/prisma.service';
import { StockEntity } from './entities/stock.entity';
import { QueueHelper } from 'src/helpers/queue.helper';
import { UpsertStockDto } from './dto/upsert-stock.dto';

@Injectable()
export class StocksService {
  constructor(
    @Inject('MODEL_PRODUCT') private readonly client: ClientKafka,
    private prismaService: PrismaService,
  ) {}

  async findOneByProduct(id: number) {
    const stock = await this.prismaService.stock.findUnique({ where: { productId: id } });

    if (!stock) {
      throw new NotFoundException(
        'Não foi possivel encontrar o produto no estoque.',
      );
    }

    if (stock.status === false) {
      throw new BadRequestException('O produto está inativo.');
    }

    return stock;
  }

  async upsert(upsertStockDto: UpsertStockDto) {
    const { id, name, status } = upsertStockDto;

    const exist = await this.prismaService.stock.findUnique({
      where: { productId: id },
    });

    if (exist) {
      return this.prismaService.stock.update({
        where: { productId: id },
        data: { name, status },
      });
    } else {
      return this.prismaService.stock.create({
        data: { productId: id, name, status },
      });
    }
  }

  emit(product: Pick<StockEntity, 'productId' | 'quantity'>) {
    const { productId: id, quantity } = product;

    this.client.emit(QueueHelper.topic, {
      product: {
        id,
        quantity,
      },
    });
  }

  consumer(payload: { product: Pick<StockEntity, 'id' | 'name' | 'status'> }) {
    return this.upsert(payload.product);
  }
}
