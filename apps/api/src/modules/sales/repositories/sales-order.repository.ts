import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { SalesOrder, Prisma } from '@prisma/client';
import {
  CreateSalesOrderDto,
  UpdateSalesOrderDto,
} from '../dto/sales-order.dto';

@Injectable()
export class SalesOrderRepository extends BaseRepository<
  SalesOrder,
  CreateSalesOrderDto,
  UpdateSalesOrderDto
> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }

  protected get model() {
    return this.prisma.salesOrder;
  }

  protected get include() {
    return {
      customer: true,
      items: true,
      activities: true,
      documents: true,
    };
  }

  protected buildSearchClause(search: string): any[] {
    return [{ code: { contains: search, mode: 'insensitive' } }];
  }

  async findByCustomer(customerId: number) {
    return this.model.findMany({
      where: { customerId },
      include: this.include,
    });
  }

  async findByStatus(status: string, companyId: number) {
    return this.model.findMany({
      where: {
        status,
        companyId,
      },
      include: this.include,
    });
  }
}
