import { Injectable } from '@nestjs/common';
import { BaseService } from '../../common/services/base.service';
import { LeadRepository } from './repositories/lead.repository';
import { CreateLeadDto, UpdateLeadDto } from './dto/lead.dto';
import { Lead } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LeadService extends BaseService<
  Lead,
  CreateLeadDto,
  UpdateLeadDto
> {
  constructor(
    protected readonly repository: LeadRepository,
    private prisma: PrismaService,
  ) {
    super(repository);
  }

  async findAll(companyId: number) {
    return this.repository.findByCompany(companyId);
  }

  async findByCampaign(campaignId: number) {
    return this.repository.findByCampaign(campaignId);
  }

  async findByStatus(status: string, companyId: number) {
    return this.repository.findByStatus(status, companyId);
  }

  async convertToCustomer(id: number) {
    // Convert lead to customer
    const lead = await this.repository.findOne(id);
    if (!lead) throw new Error('Lead not found');

    const customer = await this.prisma.customer.create({
      data: {
        companyId: lead.companyId,
        code: `CUST-${Date.now()}`,
        name: `${lead.firstName} ${lead.lastName}`,
        email: lead.email,
        phone: lead.phone,
        source: lead.source,
        assignedTo: lead.assignedTo,
      },
    });

    await this.repository.update(id, {
      status: 'CONVERTED',
      convertedToCustomerId: customer.id,
      convertedAt: new Date(),
    } as UpdateLeadDto);

    return customer;
  }
}
