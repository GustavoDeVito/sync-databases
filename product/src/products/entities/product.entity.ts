import { Product } from '@prisma/client';

export class ProductEntity implements Product {
  id: number;
  name: string;
  quantity: number;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}
