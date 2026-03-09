import { Controller, Get, Query, ParseIntPipe } from '@nestjs/common';
import { BaseController } from '../../common/controllers/base.controller';
import { SalesService } from './sales.service';
import {
  CreateSalesOrderDto,
  UpdateSalesOrderDto,
} from './dto/sales-order.dto';
import { SalesOrder } from '@prisma/client';

@Controller('sales-orders')
export class SalesController extends BaseController<
  SalesOrder,
  CreateSalesOrderDto,
  UpdateSalesOrderDto
> {
  constructor(protected readonly service: SalesService) {
    super(service);
  }

  @Get('by-customer/:customerId')
  findByCustomer(@Query('customerId', ParseIntPipe) customerId: number) {
    return this.service.findByCustomer(customerId);
  }

  @Get('by-status')
  findByStatus(
    @Query('status') status: string,
    @Query('companyId', ParseIntPipe) companyId: number,
  ) {
    return this.service.findByStatus(status, companyId);
  }
}
