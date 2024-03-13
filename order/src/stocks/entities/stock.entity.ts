import { Stock } from '@prisma/client';

export class StockEntity implements Stock {
  id: number;
  productId: number;
  name: string;
  quantity: number;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}
