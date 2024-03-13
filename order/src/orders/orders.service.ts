import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { StocksService } from 'src/stocks/stocks.service';
import { ActionEnum } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(
    private prismaService: PrismaService,
    private readonly stocksService: StocksService,
  ) {}

  findAll() {
    return this.prismaService.order.findMany({
      select: {
        id: true,
        stock: { select: { id: true, name: true } },
        quantity: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: number) {
    const order = await this.prismaService.order.findUnique({
      select: {
        id: true,
        action: true,
        quantity: true,
        stock: { select: { id: true, productId: true, name: true } },
        createdAt: true,
      },
      where: { id },
    });

    if (!order) {
      throw new NotFoundException(`A ordem com o ID#${id} não foi encontrado.`);
    }

    return order;
  }

  async create(createOrderDto: CreateOrderDto) {
    const { productId, action, quantity } = createOrderDto;

    const stock = await this.stocksService.findOneByProduct(productId);

    if (action === ActionEnum.OUTPUT && stock.quantity - quantity < 0) {
      throw new BadRequestException('Não é possivel deixar o estoque negativo');
    }

    return this.prismaService.$transaction(async (tx) => {
      let newQuantity = stock.quantity;
      if (createOrderDto.action === ActionEnum.INPUT) {
        newQuantity += quantity;
      } else {
        newQuantity -= quantity;
      }

      const orderCreate = await tx.order.create({
        data: {
          stockId: stock.id,
          action,
          quantity,
        },
      });

      await tx.stock.update({
        where: { id: stock.id },
        data: { quantity: newQuantity },
      });

      this.stocksService.emit({
        productId,
        quantity: newQuantity,
      });

      return orderCreate;
    });
  }
}
