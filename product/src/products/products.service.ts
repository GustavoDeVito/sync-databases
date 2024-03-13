import {
  Inject,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ClientKafka } from '@nestjs/microservices';
import { ProductEntity } from './entities/product.entity';
import { QueueHelper } from 'src/helpers/queue.helper';

@Injectable()
export class ProductsService implements OnModuleInit {
  constructor(
    @Inject('MODEL_PRODUCT') private readonly client: ClientKafka,
    private prismaService: PrismaService,
  ) {}

  async onModuleInit() {
    this.client.subscribeToResponseOf(QueueHelper.topic);

    await this.client.connect();
  }

  findAll() {
    return this.prismaService.product.findMany({
      select: { id: true, name: true, quantity: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    const product = await this.prismaService.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(
        `O produto com o ID#${id} não foi encontrado.`,
      );
    }

    return product;
  }

  async create(createProductDto: CreateProductDto) {
    const productCreate = await this.prismaService.product.create({
      select: { id: true, name: true, status: true },
      data: createProductDto,
    });

    this.emit(productCreate);

    return productCreate;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    await this.findOne(id);

    const productUpdate = await this.prismaService.product.update({
      select: { id: true, name: true, status: true },
      where: { id },
      data: updateProductDto,
    });

    this.emit(productUpdate);

    return productUpdate;
  }

  emit(product: Pick<ProductEntity, 'id' | 'name' | 'status'>) {
    this.client.emit(QueueHelper.topic, {
      product,
    });
  }

  async consumer(payload: { product: Pick<ProductEntity, 'id' | 'quantity'> }) {
    const {
      product: { id, quantity },
    } = payload;

    await this.findOne(id);

    await this.prismaService.product.update({
      where: { id },
      data: { quantity },
    });
  }
}
