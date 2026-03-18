import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { Branch } from '@prisma/client';
import { CreateBranchDto, UpdateBranchDto } from '../dto/branch.dto';

@Injectable()
export class BranchRepository extends BaseRepository<
  Branch,
  CreateBranchDto,
  UpdateBranchDto
> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }

  protected get model() {
    return this.prisma.branch;
  }

  protected get include() {
    return {
      company: true,
      users: false,
      warehouses: false,
    };
  }

  protected buildSearchClause(search: string): any[] {
    return [
      { name: { contains: search, mode: 'insensitive' } },
      { code: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  async findByCompany(companyId: number): Promise<Branch[]> {
    return this.model.findMany({
      where: {
        companyId,
        isDeleted: false,
      },
      include: this.include,
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findByCodeAndCompany(code: string, companyId: number): Promise<Branch | null> {
    return this.model.findFirst({
      where: {
        code,
        companyId,
        isDeleted: false,
      },
      include: this.include,
    });
  }
}

