import { Injectable } from '@nestjs/common';
import { BaseService } from '../../common/services/base.service';
import { SalesOrderRepository } from './repositories/sales-order.repository';
import {
  CreateSalesOrderDto,
  UpdateSalesOrderDto,
} from './dto/sales-order.dto';
import { SalesOrder } from '@prisma/client';

@Injectable()
export class SalesService extends BaseService<
  SalesOrder,
  CreateSalesOrderDto,
  UpdateSalesOrderDto
> {
  constructor(protected readonly repository: SalesOrderRepository) {
    super(repository);
  }

  async create(createSalesOrderDto: CreateSalesOrderDto) {
    return this.repository.create({
      ...createSalesOrderDto,
      items: {
        create: createSalesOrderDto.items || [],
      },
    } as any);
  }

  async findByCustomer(customerId: number) {
    return this.repository.findByCustomer(customerId);
  }

  async findByStatus(status: string, companyId: number) {
    return this.repository.findByStatus(status, companyId);
  }
}
