import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { Case } from '@prisma/client';
import { CreateCaseDto, UpdateCaseDto } from '../dto/case.dto';

@Injectable()
export class CaseRepository extends BaseRepository<
  Case,
  CreateCaseDto,
  UpdateCaseDto
> {
  protected get model() {
    return this.prisma.case;
  }

  protected get include() {
    return {
      customer: true,
      tickets: true,
      activities: true,
      documents: true,
      notesList: true,
    };
  }

  protected buildSearchClause(search: string): any[] {
    return [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { caseNumber: { contains: search, mode: 'insensitive' } },
    ];
  }

  async findByCompany(companyId: number) {
    return this.model.findMany({
      where: { companyId, isDeleted: false },
      include: this.include,
    });
  }

  async findByCustomer(customerId: number) {
    return this.model.findMany({
      where: { customerId, isDeleted: false },
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
