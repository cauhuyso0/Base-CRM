import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { Opportunity, Prisma } from '@prisma/client';
import {
  CreateOpportunityDto,
  UpdateOpportunityDto,
} from '../dto/opportunity.dto';

@Injectable()
export class OpportunityRepository extends BaseRepository<
  Opportunity,
  CreateOpportunityDto,
  UpdateOpportunityDto
> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }

  protected get model() {
    return this.prisma.opportunity;
  }

  protected get include() {
    return {
      customer: true,
      products: true,
      activities: true,
      tasks: true,
      documents: true,
      notesList: true,
    };
  }

  protected buildSearchClause(search: string): any[] {
    return [
      { name: { contains: search, mode: 'insensitive' } },
      { code: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  async findByStage(stage: string, companyId: number) {
    return this.model.findMany({
      where: {
        stage,
        companyId,
      },
      include: this.include,
    });
  }

  async findByCustomer(customerId: number) {
    return this.model.findMany({
      where: { customerId },
      include: this.include,
    });
  }
}
