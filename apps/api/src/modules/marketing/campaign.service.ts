import { Injectable } from '@nestjs/common';
import { BaseService } from '../../common/services/base.service';
import { CampaignRepository } from './repositories/campaign.repository';
import { CreateCampaignDto, UpdateCampaignDto } from './dto/campaign.dto';
import { Campaign } from '@prisma/client';

@Injectable()
export class CampaignService extends BaseService<
  Campaign,
  CreateCampaignDto,
  UpdateCampaignDto
> {
  constructor(protected readonly repository: CampaignRepository) {
    super(repository);
  }

  async findAll(companyId?: number, filters?: any) {
    if (companyId !== undefined && Number.isFinite(companyId)) {
      return this.repository.findByCompany(companyId);
    }
    return this.repository.findAll(filters);
  }

  async findByStatus(status: string, companyId: number) {
    return this.repository.findByStatus(status, companyId);
  }
}
