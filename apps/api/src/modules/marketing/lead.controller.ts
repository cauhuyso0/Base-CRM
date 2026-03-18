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
import { LeadService } from './lead.service';
import { CreateLeadDto, UpdateLeadDto } from './dto/lead.dto';

@Controller('leads')
export class LeadController {
  constructor(private readonly leadService: LeadService) {}

  @Post()
  create(@Request() req: any, @Body() createLeadDto: CreateLeadDto) {
    const payload = createLeadDto as unknown as Record<string, unknown>;
    if (!req.user?.isSuperAdmin && payload.companyId === undefined) {
      payload.companyId = req.user.companyId;
    }
    return this.leadService.create(createLeadDto);
  }

  @Get()
  findAll(@Request() req: any, @Query() filters: any) {
    const companyId =
      req.user?.isSuperAdmin
        ? filters.companyId !== undefined
          ? Number(filters.companyId)
          : undefined
        : Number(req.user.companyId);
    return this.leadService.findAll(companyId, filters);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.leadService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLeadDto: UpdateLeadDto,
  ) {
    return this.leadService.update(id, updateLeadDto);
  }

  @Post(':id/convert')
  convertToCustomer(
    @Param('id', ParseIntPipe) id: number,
    @Body() customerData: any,
  ) {
    return this.leadService.convertToCustomer(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.leadService.remove(id);
  }
}
