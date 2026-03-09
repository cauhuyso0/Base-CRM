import { Module } from '@nestjs/common';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { OpportunityService } from './opportunity.service';
import { OpportunityController } from './opportunity.controller';
import { SalesOrderRepository } from './repositories/sales-order.repository';
import { OpportunityRepository } from './repositories/opportunity.repository';

@Module({
  controllers: [SalesController, OpportunityController],
  providers: [
    SalesService,
    OpportunityService,
    SalesOrderRepository,
    OpportunityRepository,
  ],
  exports: [
    SalesService,
    OpportunityService,
    SalesOrderRepository,
    OpportunityRepository,
  ],
})
export class SalesModule {}
