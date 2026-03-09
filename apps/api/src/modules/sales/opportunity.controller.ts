import { Controller, Get, Query, ParseIntPipe } from '@nestjs/common';
import { BaseController } from '../../common/controllers/base.controller';
import { OpportunityService } from './opportunity.service';
import {
  CreateOpportunityDto,
  UpdateOpportunityDto,
} from './dto/opportunity.dto';
import { Opportunity } from '@prisma/client';

@Controller('opportunities')
export class OpportunityController extends BaseController<
  Opportunity,
  CreateOpportunityDto,
  UpdateOpportunityDto
> {
  constructor(protected readonly service: OpportunityService) {
    super(service);
  }

  @Get('by-stage')
  findByStage(
    @Query('stage') stage: string,
    @Query('companyId', ParseIntPipe) companyId: number,
  ) {
    return this.service.findByStage(stage, companyId);
  }

  @Get('by-customer/:customerId')
  findByCustomer(@Query('customerId', ParseIntPipe) customerId: number) {
    return this.service.findByCustomer(customerId);
  }
}
