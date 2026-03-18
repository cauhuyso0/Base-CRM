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
import { CaseService } from './case.service';
import { CreateCaseDto, UpdateCaseDto } from './dto/case.dto';

@Controller('cases')
export class CaseController {
  constructor(private readonly caseService: CaseService) {}

  @Post()
  create(@Request() req: any, @Body() createCaseDto: CreateCaseDto) {
    const payload = createCaseDto as unknown as Record<string, unknown>;
    if (!req.user?.isSuperAdmin && payload.companyId === undefined) {
      payload.companyId = req.user.companyId;
    }
    return this.caseService.create(createCaseDto);
  }

  @Get()
  findAll(@Request() req: any, @Query() filters: any) {
    const companyId =
      req.user?.isSuperAdmin
        ? filters.companyId !== undefined
          ? Number(filters.companyId)
          : undefined
        : Number(req.user.companyId);
    return this.caseService.findAll(companyId, filters);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.caseService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCaseDto: UpdateCaseDto,
  ) {
    return this.caseService.update(id, updateCaseDto);
  }

  @Post(':id/resolve')
  resolve(
    @Param('id', ParseIntPipe) id: number,
    @Body('resolution') resolution: string,
  ) {
    return this.caseService.resolve(id, resolution);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.caseService.remove(id);
  }
}
