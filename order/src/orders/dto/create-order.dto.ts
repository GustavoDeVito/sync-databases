import { ActionEnum } from '@prisma/client';
import { IsEnum, IsInt, Min } from 'class-validator';

export class CreateOrderDto {
  @IsInt()
  productId: number;

  @IsEnum(ActionEnum)
  action: ActionEnum;

  @IsInt()
  @Min(1)
  quantity: number;
}
