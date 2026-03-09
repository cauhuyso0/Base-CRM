import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseService } from '../../common/services/base.service';
import { CompanyRepository } from './repositories/company.repository';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/company.dto';
import { Company } from '@prisma/client';

@Injectable()
export class CompanyService extends BaseService<
  Company,
  CreateCompanyDto,
  UpdateCompanyDto
> {
  constructor(protected readonly repository: CompanyRepository) {
    super(repository);
  }

  async findByCode(code: string): Promise<Company> {
    const company = await this.repository.findByCode(code);
    if (!company) {
      throw new NotFoundException(`Company with code ${code} not found`);
    }
    return company;
  }

  async findByUuid(uuid: string): Promise<Company> {
    const company = await this.repository.findByUuid(uuid);
    if (!company) {
      throw new NotFoundException(`Company with uuid ${uuid} not found`);
    }
    return company;
  }

  async findActive(): Promise<Company[]> {
    return this.repository.findActive();
  }
}
