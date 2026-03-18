import { Injectable } from '@nestjs/common';
import { BaseService } from '../../common/services/base.service';
import { CaseRepository } from './repositories/case.repository';
import { CreateCaseDto, UpdateCaseDto } from './dto/case.dto';
import { Case } from '@prisma/client';

@Injectable()
export class CaseService extends BaseService<
  Case,
  CreateCaseDto,
  UpdateCaseDto
> {
  constructor(protected readonly repository: CaseRepository) {
    super(repository);
  }

  async findAll(companyId?: number, filters?: any) {
    if (companyId !== undefined && Number.isFinite(companyId)) {
      return this.repository.findByCompany(companyId);
    }
    return this.repository.findAll(filters);
  }

  async findByCustomer(customerId: number) {
    return this.repository.findByCustomer(customerId);
  }

  async findByStatus(status: string, companyId: number) {
    return this.repository.findByStatus(status, companyId);
  }

  async resolve(id: number, resolution: string) {
    return this.repository.update(id, {
      status: 'RESOLVED',
      resolution,
      resolvedAt: new Date(),
    } as UpdateCaseDto);
  }
}
