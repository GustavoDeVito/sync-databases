import { $Enums, Order } from '@prisma/client';

export class OrderEntity implements Order {
  id: number;
  stockId: number;
  action: $Enums.ActionEnum;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}
