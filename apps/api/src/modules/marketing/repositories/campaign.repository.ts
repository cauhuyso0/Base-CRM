import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { Campaign } from '@prisma/client';
import { CreateCampaignDto, UpdateCampaignDto } from '../dto/campaign.dto';

@Injectable()
export class CampaignRepository extends BaseRepository<
  Campaign,
  CreateCampaignDto,
  UpdateCampaignDto
> {
  protected get model() {
    return this.prisma.campaign;
  }

  protected get include() {
    return {
      campaignTargets: true,
      activities: true,
      documents: true,
    };
  }

  protected buildSearchClause(search: string): any[] {
    return [
      { name: { contains: search, mode: 'insensitive' } },
      { code: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  async findByCompany(companyId: number) {
    return this.model.findMany({
      where: { companyId, isDeleted: false },
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
