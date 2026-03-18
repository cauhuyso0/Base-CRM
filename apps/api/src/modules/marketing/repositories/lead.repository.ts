import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { Lead } from '@prisma/client';
import { CreateLeadDto, UpdateLeadDto } from '../dto/lead.dto';

@Injectable()
export class LeadRepository extends BaseRepository<
  Lead,
  CreateLeadDto,
  UpdateLeadDto
> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }

  protected get model() {
    return this.prisma.lead;
  }

  protected get include() {
    return {
      activities: true,
      tasks: true,
      documents: true,
      notesList: true,
    };
  }

  protected buildSearchClause(search: string): any[] {
    return [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
      { company: { contains: search, mode: 'insensitive' } },
    ];
  }

  async findByCompany(companyId: number) {
    return this.model.findMany({
      where: { companyId, isDeleted: false },
      include: this.include,
    });
  }

  async findByCampaign(campaignId: number) {
    return this.model.findMany({
      where: { campaignId, isDeleted: false },
      include: this.include,
    });
  }

  async findByStatus(status: string, companyId: number) {
    return this.model.findMany({
      where: { status, companyId, isDeleted: false },
      include: this.include,
    });
  }
}
