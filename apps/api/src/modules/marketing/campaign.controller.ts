import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  Request,
} from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { CreateCampaignDto, UpdateCampaignDto } from './dto/campaign.dto';

@Controller('campaigns')
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Post()
  create(@Request() req: any, @Body() createCampaignDto: CreateCampaignDto) {
    const payload = createCampaignDto as unknown as Record<string, unknown>;
    if (!req.user?.isSuperAdmin && payload.companyId === undefined) {
      payload.companyId = req.user.companyId;
    }
    return this.campaignService.create(createCampaignDto);
  }

  @Get()
  findAll(@Request() req: any, @Query() filters: any) {
    const companyId =
      req.user?.isSuperAdmin
        ? filters.companyId !== undefined
          ? Number(filters.companyId)
          : undefined
        : Number(req.user.companyId);
    return this.campaignService.findAll(companyId, filters);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.campaignService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCampaignDto: UpdateCampaignDto,
  ) {
    return this.campaignService.update(id, updateCampaignDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.campaignService.remove(id);
  }
}
