import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseService } from '../../common/services/base.service';
import { BranchRepository } from './repositories/branch.repository';
import { CreateBranchDto, UpdateBranchDto } from './dto/branch.dto';
import { Branch } from '@prisma/client';

@Injectable()
export class BranchService extends BaseService<
  Branch,
  CreateBranchDto,
  UpdateBranchDto
> {
  constructor(protected readonly repository: BranchRepository) {
    super(repository);
  }

  async findByCompany(companyId: number): Promise<Branch[]> {
    return this.repository.findByCompany(companyId);
  }

  async findByCodeAndCompany(code: string, companyId: number): Promise<Branch> {
    const branch = await this.repository.findByCodeAndCompany(code, companyId);
    if (!branch) {
      throw new NotFoundException(`Branch with code ${code} not found in company ${companyId}`);
    }
    return branch;
  }
}

