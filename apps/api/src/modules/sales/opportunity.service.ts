import { Injectable } from '@nestjs/common';
import { BaseService } from '../../common/services/base.service';
import { OpportunityRepository } from './repositories/opportunity.repository';
import {
  CreateOpportunityDto,
  UpdateOpportunityDto,
} from './dto/opportunity.dto';
import { Opportunity } from '@prisma/client';

@Injectable()
export class OpportunityService extends BaseService<
  Opportunity,
  CreateOpportunityDto,
  UpdateOpportunityDto
> {
  constructor(protected readonly repository: OpportunityRepository) {
    super(repository);
  }

  async create(createOpportunityDto: CreateOpportunityDto) {
    return this.repository.create({
      ...createOpportunityDto,
      products: {
        create: createOpportunityDto.products || [],
      },
    } as any);
  }

  async findByStage(stage: string, companyId: number) {
    return this.repository.findByStage(stage, companyId);
  }

  async findByCustomer(customerId: number) {
    return this.repository.findByCustomer(customerId);
  }
}
