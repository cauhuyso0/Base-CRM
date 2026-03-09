import { Module } from '@nestjs/common';
import { CampaignController } from './campaign.controller';
import { CampaignService } from './campaign.service';
import { CampaignRepository } from './repositories/campaign.repository';
import { LeadController } from './lead.controller';
import { LeadService } from './lead.service';
import { LeadRepository } from './repositories/lead.repository';

@Module({
  controllers: [CampaignController, LeadController],
  providers: [CampaignService, CampaignRepository, LeadService, LeadRepository],
  exports: [CampaignService, CampaignRepository, LeadService, LeadRepository],
})
export class MarketingModule {}
